const R = require('ramda');
const graphql = require('graphql');
const GraphQLDate = require('graphql-date');
const GraphQLJSON = require('graphql-type-json');
const GraphQLUnionInputType = require('graphql-union-input-type');
const graphqlHTTP = require('express-graphql');
const shared = require('davis-shared');
const {thread} = shared.fp;
const {isNilOrEmpty} = shared.string;
const model = require('davis-model');
const { dataSet, folder, variable, attribute } = model;
const q = model.query.build;
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const queryString = require('./model/queryString');

module.exports = ({
  entityRepository,
  entityLoaderFactory,
  dataQuery
}) => {

  const entityLoaders = entityLoaderFactory([
    dataSet.entityType,
    folder.entityType,
    variable.entityType,
    attribute.entityType
  ]);

  const resolveEntityFromId = (propertyName, entityType) =>
    props => {
      const id = props[propertyName];
      if(R.isNil(id)){
        return null;
      }
      return entityLoaders[entityType].load(props[propertyName]); 
    };

  // *** Shared Fields ***
  const entityFields = {
    entityType : { type : graphql.GraphQLString },
    id         : { type : graphql.GraphQLInt },
    name       : { type : graphql.GraphQLString },
    created    : { type : GraphQLDate },
    modified   : { type : GraphQLDate }
  };

  const entityCreateFields = {
    entityType : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) },
    name       : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) }
  };

  const entityUpdateFields = {
    id         : { type : new graphql.GraphQLNonNull(graphql.GraphQLInt) },
    entityType : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) },
    name       : { type : graphql.GraphQLString }
  };

  // *** Entity Type Definitions ***
  // *** Entity Interface ***
  const graphQLEntity = new graphql.GraphQLInterfaceType({
    name: 'Entity',
    fields: entityFields,
    resolveType: function(value){
      if(value.entityType === folder.entityType){
        return graphQLFolder;
      }
      if(value.entityType === dataSet.entityType){
        return graphQLDataSet;
      }
      if(value.entityType === variable.entityType){
        return graphQLVariable;
      }
      if(value.entityType === attribute.entityType){
        return graphQLAttribute;
      }
    }
  });

  // *** Folder ***
  const graphQLFolder = new graphql.GraphQLObjectType({
    name: 'Folder',
    interfaces: [graphQLEntity],
    fields: () => Object.assign({}, entityFields, {
      parent: {
        type : graphQLFolder,
        resolve: resolveEntityFromId('parent', folder.entityType)
      }
    })
  });

  const graphQLFolderCreate = new graphql.GraphQLInputObjectType({
    name: 'FolderCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      parent: { type: graphql.GraphQLInt }
    })
  });

  const graphQLFolderUpdate = new graphql.GraphQLInputObjectType({
    name: 'FolderUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      parent: { type: graphql.GraphQLInt }
    })
  });

  // *** Data Set ***
  const graphQLDataSet = new graphql.GraphQLObjectType({
    name: 'DataSet',
    interfaces: [graphQLEntity],
    fields: Object.assign({}, entityFields, {
      folder: {
        type : graphQLFolder,
        // Resolve the folder object from the folder ID
        resolve: resolveEntityFromId('folder', folder.entityType)
      },
      dataModified : { type : GraphQLDate },
      schema: { type: GraphQLJSON }
    })
  });

  const graphQLDataSetCreate = new graphql.GraphQLInputObjectType({
    name: 'DataSetCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      folder: { type: graphql.GraphQLInt },
      schema: { type: GraphQLJSON }
    })
  });

  const graphQLDataSetUpdate = new graphql.GraphQLInputObjectType({
    name: 'DataSetUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      folder: { type: graphql.GraphQLInt },
      schema: { type: GraphQLJSON }
    })
  });

  // *** Variable ***
  const graphQLVariable = new graphql.GraphQLObjectType({
    name: 'Variable',
    interfaces: [graphQLEntity],
    fields: () => Object.assign({}, entityFields, {
      type: { type: graphql.GraphQLInt },
      key: { type: graphql.GraphQLString },
      format: { type: GraphQLJSON },
      scopedDataSet: {
        type : graphQLDataSet,
        // Resolve the data set object from the data set ID
        resolve: resolveEntityFromId('scopedDataSet', dataSet.entityType)
      },
      attributes: {
        type : new graphql.GraphQLList(graphQLAttribute),
        resolve: ({id}) => task2Promise(entityRepository.query(
          attribute.entityType,
          q.eq('variable', id)))
      },
    })
  });

  const graphQLVariableCreate = new graphql.GraphQLInputObjectType({
    name: 'VariableCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      type         : { type : graphql.GraphQLInt },
      key          : { type : graphql.GraphQLString },
      scopedDatSet : { type : graphql.GraphQLInt },
      format       : { type : GraphQLJSON }
    })
  });

  const graphQLVariableUpdate = new graphql.GraphQLInputObjectType({
    name: 'VariableUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      type         : { type : graphql.GraphQLInt },
      key          : { type : graphql.GraphQLString },
      scopedDatSet : { type : graphql.GraphQLInt },
      format       : { type : GraphQLJSON }
    })
  });

  // *** Attribute ***
  const graphQLAttribute = new graphql.GraphQLObjectType({
    name: 'Attribute',
    interfaces: [graphQLEntity],
    fields: () => Object.assign({}, entityFields, {
      // Resolve the variable object from the variable ID
      variable: {
        type : graphQLVariable,
        resolve: resolveEntityFromId('variable', variable.entityType)
      },
      key: { type: graphql.GraphQLString },
      parent: {
        type : graphQLAttribute,
        resolve: resolveEntityFromId('parent', attribute.entityType)
      }
    })
  });

  const graphQLAttributeCreate = new graphql.GraphQLInputObjectType({
    name: 'AttributeCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      key      : { type : graphql.GraphQLString },
      variable : { type : graphql.GraphQLInt },
      parent   : { type : GraphQLJSON }
    })
  });

  const graphQLAttributeUpdate = new graphql.GraphQLInputObjectType({
    name: 'AttributeUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      key      : { type : graphql.GraphQLString },
      variable : { type : graphql.GraphQLInt },
      parent   : { type : GraphQLJSON }
    })
  });

  // *** Entity Input Union Types ***
  const graphQLEntityCreate = new GraphQLUnionInputType({
    name: 'EntityCreate',
    inputTypes: [
      graphQLFolderCreate,
      graphQLDataSetCreate,
      graphQLVariableCreate,
      graphQLAttributeCreate
    ],
    typeKey: 'entityType',
    resolveType: function(type){
      if(type === folder.entityType){
        return graphQLFolderCreate;
      }
      if(type === dataSet.entityType){
        return graphQLDataSetCreate;
      }
      if(type === variable.entityType){
        return graphQLVariableCreate;
      }
      if(type === attribute.entityType){
        return graphQLAttributeCreate;
      }
    }
  });

  const graphQLEntityUpdate = new GraphQLUnionInputType({
    name: 'EntityUpdate',
    inputTypes: [
      graphQLFolderUpdate,
      graphQLDataSetUpdate,
      graphQLVariableUpdate,
      graphQLAttributeUpdate
    ],
    typeKey: 'entityType',
    resolveType: function(type){
      if(type === folder.entityType){
        return graphQLFolderUpdate;
      }
      if(type === dataSet.entityType){
        return graphQLDataSetUpdate;
      }
      if(type === variable.entityType){
        return graphQLVariableUpdate;
      }
      if(type === attribute.entityType){
        return graphQLAttributeUpdate;
      }
    }
  });

  function entityAllGraphQLQuery(graphQLType, entityType){
    return {
      type: new graphql.GraphQLList(graphQLType),
      resolve: () => task2Promise(entityRepository.queryAll(entityType))
    };
  }

  function entityGraphQLQuery(graphQLType, entityType){
    return {
      type: new graphql.GraphQLList(graphQLType),
      args: {
        id: {
          type : graphql.GraphQLInt,
          defaultValue: 0
        },
        query: {
          type : GraphQLJSON,
          defaultValue: []
        }
      },
      resolve: (_, {id, query}) => {
        const queryExp = id !== 0 ?  q.eq('id', id) : query;
        return task2Promise(entityRepository.query(entityType, queryExp));
      }
    };
  }

  const graphQLEntityQuery = new graphql.GraphQLObjectType({
    name: 'EntityQuery',
    fields: {
      folders: entityAllGraphQLQuery(graphQLFolder, folder.entityType),
      folder: entityGraphQLQuery(graphQLFolder, folder.entityType),
      dataSets: entityAllGraphQLQuery(graphQLDataSet, dataSet.entityType),
      dataSet: entityGraphQLQuery(graphQLDataSet, dataSet.entityType),
      variables: entityAllGraphQLQuery(graphQLVariable, variable.entityType),
      variable: entityGraphQLQuery(graphQLVariable, variable.entityType),
      attributes: entityAllGraphQLQuery(graphQLAttribute, attribute.entityType),
      attribute: entityGraphQLQuery(graphQLAttribute, attribute.entityType),
    }
  });

  const graphQLEntityMutation = new graphql.GraphQLObjectType({
    name: 'EntityMutation',
    fields: {
      create: {
        type: new graphql.GraphQLList(graphQLEntity),
        args: {
          entities: { type: new graphql.GraphQLList(graphQLEntityCreate) }
        },
        resolve: (_, {entities}) => task2Promise(entityRepository.create(entities))
      },
      update: {
        type: new graphql.GraphQLList(graphQLEntity),
        args: {
          entities: { type: new graphql.GraphQLList(graphQLEntityUpdate) }
        },
        resolve: (_, {entities}) => task2Promise(entityRepository.update(entities))
      },
      delete: {
        type: graphql.GraphQLBoolean,
        args: {
          entityType : { type : graphql.GraphQLString },
          ids        : { type : new graphql.GraphQLList(graphql.GraphQLInt) }
        },
        resolve: (_, {entityType, ids}) => task2Promise(entityRepository.delete(entityType, ids))
      }
    }
  });

  const factFields = {
    variable: {
      type: graphQLVariable,
      resolve: resolveEntityFromId('variable', variable.entityType)
    },
    type: {
      type: graphql.GraphQLInt
    }
  };

  const graphQLFact = new graphql.GraphQLInterfaceType({
    name: 'Fact',
    fields: factFields,
    resolveType: function(value){
      if(value.type === variable.types.categorical){
        return graphQLCategoricalFact;
      }
      if(value.type === variable.types.quantitative){
        return graphQLQuantitativeFact;
      }
    }
  });
    
  const graphQLCategoricalFact = new graphql.GraphQLObjectType({
    name: 'CategoricalFact',
    interfaces: [graphQLFact],
    fields: Object.assign({}, factFields, {
      attribute: {
        type: graphQLAttribute,
        resolve: resolveEntityFromId('attribute', attribute.entityType)
      }
    })
  });

  const graphQLQuantitativeFact = new graphql.GraphQLObjectType({
    name: 'QuantitativeFact',
    interfaces: [graphQLFact],
    fields: Object.assign({}, factFields, {
      value: {
        type: graphql.GraphQLFloat  
      }
    })
  });

  const graphQLIndividual = new graphql.GraphQLObjectType({
    name: 'Individual',
    fields:{
      id: {
        type: graphql.GraphQLInt
      },
      dataSet: {
        type: graphQLDataSet,
        resolve: resolveEntityFromId('dataSet', dataSet.entityType)
      },
      facts: {
        type: new graphql.GraphQLList(graphQLFact)
      }
    }
  });

  const graphQLDataSetQueryResults = new graphql.GraphQLObjectType({
    name: 'DataSetQueryResults',
    fields: {
      dataSet:{
        type: graphQLDataSet,
        resolve: resolveEntityFromId('dataSet', dataSet.entityType)
      },
      data: {
        type: new graphql.GraphQLList(graphQLIndividual)
      }
    }
  });

  const graphQLDataQuery = {
    type: new graphql.GraphQLList(graphQLDataSetQueryResults),
    args: {
      dataSets: {
        type: new graphql.GraphQLList(graphql.GraphQLInt),
        defaultValue: []
      },
      q: {
        type: graphql.GraphQLString,
        defaultValue: '' 
      }
    },
    resolve: (_, {dataSets, q}) => {

      const filters = isNilOrEmpty(q) ? null :
        thread(q,
        queryString.stringToMap,
        queryString.queryFilters.deSerialize);

      return task2Promise(dataQuery(filters, dataSets));
    }
  };
    
  const schema = new graphql.GraphQLSchema({
    // Manually include types that aren't used elsewhere
    types: [graphQLQuantitativeFact, graphQLCategoricalFact],
    query: new graphql.GraphQLObjectType({
      name: 'Query',
      fields: {
        entities: { type: graphQLEntityQuery, resolve: () => ({}) },
        data: graphQLDataQuery
      }
    }),
    mutation: new graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: {
        entities: { type: graphQLEntityMutation, resolve: () => ({}) }
      }
    })
  });

  return {
    schema,
    server: graphqlHTTP({
      schema,
      graphiql: true
    })
  };
};
