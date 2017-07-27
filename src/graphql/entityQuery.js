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

  function entityAllGraphQLQuery(gqlType, entityType){
    return {
      type: new graphql.GraphQLList(gqlType),
      resolve: () => task2Promise(entityRepository.queryAll(entityType))
    };
  }

  function entityGraphQLQuery(gqlType, entityType){
    return {
      type: new graphql.GraphQLList(gqlType),
      args: {
        id: {
          type : graphql.GraphQLInt,
          defaultValue: 0
        },
        query: {
          type : graphql.GraphQLJSON,
          defaultValue: []
        }
      },
      resolve: (_, {id, query}) => {
        const queryExp = id !== 0 ?  q.eq('id', id) : query;
        return task2Promise(entityRepository.query(entityType, queryExp));
      }
    };
  }

  const gqlEntityQuery = registry => new graphql.GraphQLObjectType({
    name: 'EntityQuery',
    fields: {
      folders: entityAllGraphQLQuery(getType('Folder', registry), folder.entityType),
      folder: entityGraphQLQuery(getType('Folder', registry), folder.entityType),
      dataSets: entityAllGraphQLQuery(getType('DataSet', registry), dataSet.entityType),
      dataSet: entityGraphQLQuery(getType('DataSet', registry), dataSet.entityType),
      variables: entityAllGraphQLQuery(getType('Variable', registry), variable.entityType),
      variable: entityGraphQLQuery(getType('Variable', registry), variable.entityType),
      attributes: entityAllGraphQLQuery(getType('Attribute', registry), attribute.entityType),
      attribute: entityGraphQLQuery(getType('Attribute', registry), attribute.entityType),
    }
  });

  const gqlEntityMutation = registry => new graphql.GraphQLObjectType({
    name: 'EntityMutation',
    fields: {
      create: {
        type: new graphql.GraphQLList(getType('Entity', registry)),
        args: {
          entities: { type: new graphql.GraphQLList(getType('EntityCreate', registry)) }
        },
        resolve: (_, {entities}) => task2Promise(entityRepository.create(entities))
      },
      update: {
        type: new graphql.GraphQLList(getType('Entity', registry)),
        args: {
          entities: { type: new graphql.GraphQLList(getType('EntityUpdate', registry)) }
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

  return {
    gqlEntityQuery,
    gqlEntityMutation,
  };
};
