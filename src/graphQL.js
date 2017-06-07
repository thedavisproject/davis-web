const R = require('ramda');
const graphql = require('graphql');
const GraphQLDate = require('graphql-date');
const GraphQLJSON = require('graphql-type-json');
const GraphQLUnionInputType = require('graphql-union-input-type');
const graphqlHTTP = require('express-graphql');
const model = require('davis-model');
const { dataSet, folder, variable, attribute } = model;
const q = model.query.build;
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  entityRepository
}) => {

  const nullAwareQueryFirstById = R.curry((queryFn, id) =>
    !R.isNil(id) ?
      queryFn(id).map(R.head) :
      Task.of(null));

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
        resolve: ({parent: parentId}) => task2Promise(
          nullAwareQueryFirstById(
            () => entityRepository.queryById(folder.entityType, parentId),
            parentId))
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
        resolve: ({folder: folderId}) => task2Promise(
          nullAwareQueryFirstById(
            () => entityRepository.queryById(folder.entityType, folderId),
            folderId))
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
        resolve: ({scopedDataSet: dataSetId}) => task2Promise(
          nullAwareQueryFirstById(
            () => entityRepository.queryById(dataSet.entityType, dataSetId),
            dataSetId))
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
        resolve: ({variable: variableId}) => task2Promise(
          nullAwareQueryFirstById(
            () => entityRepository.queryById(variable.entityType, variableId),
            variableId))
      },
      key: { type: graphql.GraphQLString },
      parent: {
        type : graphQLAttribute,
        resolve: ({parent: parentId}) => task2Promise(
          nullAwareQueryFirstById(
            () => entityRepository.queryById(attribute.entityType, parentId),
            parentId))
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

  // Top Level API
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
    
  const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
      name: 'Query',
      fields: {
        entities: { type: graphQLEntityQuery, resolve: () => ({}) }
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
