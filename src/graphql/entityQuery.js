const R = require('ramda');
const model = require('davis-model');
const { dataSet, folder, variable, attribute } = model;
const q = model.query.build;
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const { getType } = require('./typeRegistry');


module.exports = ({
  entityRepository,
  graphql
}) => {

  function entityIndividualGraphQLQuery(gqlType, entityType){
    return {
      type: gqlType,
      args: {
        id: {
          type : new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        const queryExp = q.eq('id', id);
        return task2Promise(
          entityRepository.query(entityType, queryExp)
            .map(results => R.isNil(results) || results.length < 1 ? null : results[0]));
      }
    };
  }

  function entityGraphQLQuery(gqlType, entityType){
    return {
      type: new graphql.GraphQLList(gqlType),
      args: {
        query: {
          type : graphql.GraphQLJSON,
          defaultValue: []
        }
      },
      resolve: (_, {query}) => {
        return task2Promise(entityRepository.query(entityType, query));
      }
    };
  }

  const gqlEntityQuery = registry => new graphql.GraphQLObjectType({
    name: 'EntityQuery',
    fields: {
      folders: entityGraphQLQuery(getType('Folder', registry), folder.entityType),
      folder: entityIndividualGraphQLQuery(getType('Folder', registry), folder.entityType),
      dataSets: entityGraphQLQuery(getType('DataSet', registry), dataSet.entityType),
      dataSet: entityIndividualGraphQLQuery(getType('DataSet', registry), dataSet.entityType),
      variables: entityGraphQLQuery(getType('Variable', registry), variable.entityType),
      variable: entityIndividualGraphQLQuery(getType('Variable', registry), variable.entityType),
      attributes: entityGraphQLQuery(getType('Attribute', registry), attribute.entityType),
      attribute: entityIndividualGraphQLQuery(getType('Attribute', registry), attribute.entityType)
    }
  });

  const entityMutate = mutateFn => entityType => R.pipe(
    R.map(R.assoc('entityType', entityType)),
    mutateFn,
    task2Promise);

  const entityCreate = entityMutate(entityRepository.create);
  const entityUpdate = entityMutate(entityRepository.update);

  const entityGraphQLMutate = (gqlInputType, gqlOutputType, parameterName, resolveFn) => {
    const config = {
      type: new graphql.GraphQLList(gqlOutputType),
      args: {},
      resolve: (_, args) => resolveFn(args[parameterName])
    };

    config.args[parameterName] = { type: new graphql.GraphQLList(gqlInputType) };

    return config;
  };

  const gqlEntityCreate = registry => new graphql.GraphQLObjectType({
    name: 'EntityCreate',
    fields: {
      folders: entityGraphQLMutate(
        getType('FolderCreate', registry), 
        getType('Folder', registry),
        'folders',
        entityCreate(folder.entityType)),

      dataSets: entityGraphQLMutate(
        getType('DataSetCreate', registry), 
        getType('DataSet', registry),
        'dataSets',
        entityCreate(dataSet.entityType)),

      variables: entityGraphQLMutate(
        getType('VariableCreate', registry), 
        getType('Variable', registry),
        'variables',
        entityCreate(variable.entityType)),

      attributes: entityGraphQLMutate(
        getType('AttributeCreate', registry), 
        getType('Attribute', registry),
        'attributes',
        entityCreate(attribute.entityType))
    }
  });

  const gqlEntityUpdate = registry => new graphql.GraphQLObjectType({
    name: 'EntityUpdate',
    fields: {
      folders: entityGraphQLMutate(
        getType('FolderUpdate', registry), 
        getType('Folder', registry),
        'folders',
        entityUpdate(folder.entityType)),

      dataSets: entityGraphQLMutate(
        getType('DataSetUpdate', registry), 
        getType('DataSet', registry),
        'dataSets',
        entityUpdate(dataSet.entityType)),
      
      variables: entityGraphQLMutate(
        getType('VariableUpdate', registry), 
        getType('Variable', registry),
        'variables',
        entityUpdate(variable.entityType)),
      
      attributes: entityGraphQLMutate(
        getType('AttributeUpdate', registry), 
        getType('Attribute', registry),
        'attributes',
        entityUpdate(attribute.entityType))
    }
  });

  const entityGraphQLDelete = entityType => {
    return {
      type: graphql.GraphQLBoolean,
      args: {
        ids: { type : new graphql.GraphQLList(graphql.GraphQLInt) }
      },
      resolve: (_, {ids}) => task2Promise(entityRepository.delete(entityType, ids))
    }
  };

  const gqlEntityDelete = registry => new graphql.GraphQLObjectType({
    name: 'EntityDelete',
    fields: {
      folders: entityGraphQLDelete(folder.entityType),
      dataSets: entityGraphQLDelete(dataSet.entityType),
      variables: entityGraphQLDelete(variable.entityType),
      attributes: entityGraphQLDelete(attribute.entityType),
    }
  });

  const gqlEntityMutation = registry => new graphql.GraphQLObjectType({
    name: 'EntityMutation',
    fields: {
      create: { type: getType('EntityCreate', registry), resolve: () => ({}) },
      update: { type: getType('EntityUpdate', registry), resolve: () => ({}) },
      delete: { type: getType('EntityDelete', registry), resolve: () => ({}) }
    }
  });

  return {
    gqlEntityQuery,
    gqlEntityCreate,
    gqlEntityUpdate,
    gqlEntityDelete,
    gqlEntityMutation
  };
};
