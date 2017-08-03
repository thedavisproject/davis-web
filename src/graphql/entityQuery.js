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
      attribute: entityIndividualGraphQLQuery(getType('Attribute', registry), attribute.entityType),
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
