const model = require('davis-model');
const { dataSet, attribute, variable } = model;
const q = model.query.build;
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const { getType } = require('../typeRegistry');

module.exports = ({
  entityRepository,
  graphql,
  graphql_entity: { entityFields, entityCreateFields, entityUpdateFields },
  graphql_entityResolver: { resolveEntityFromId }
}) => {

  const gqlVariableTypeEnum = registryIgnored => new graphql.GraphQLEnumType({
    name: 'VariableType',
    values: {
      CATEGORICAL: { value: variable.types.categorical },
      NUMERICAL: { value: variable.types.numerical },
      TEXT: { value: variable.types.text }
    }
  });

  const gqlVariable = registry => new graphql.GraphQLObjectType({
    name: 'Variable',
    interfaces: [getType('Entity', registry)],
    fields: () => Object.assign({}, entityFields, {
      type: { type: getType('VariableType', registry)},
      key: { type: graphql.GraphQLString },
      format: { type: graphql.GraphQLJSON },
      scopedDataSet: {
        type: getType('DataSet', registry),
        // Resolve the data set object from the data set ID
        resolve: resolveEntityFromId('scopedDataSet', dataSet.entityType)
      },
      attributes: {
        type : new graphql.GraphQLList(getType('Attribute', registry)),
        resolve: ({id}) => task2Promise(entityRepository.query(
          attribute.entityType,
          q.eq('variable', id)))
      }
    })
  });

  const gqlVariableCreate = registry => new graphql.GraphQLInputObjectType({
    name: 'VariableCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      type         : { type : new graphql.GraphQLNonNull(getType('VariableType', registry))},
      key          : { type : graphql.GraphQLString },
      scopedDatSet : { type : graphql.GraphQLInt },
      format       : { type : graphql.GraphQLJSON }
    })
  });

  const gqlVariableUpdate = registry => new graphql.GraphQLInputObjectType({
    name: 'VariableUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      type         : { type: getType('VariableType', registry)},
      key          : { type : graphql.GraphQLString },
      scopedDatSet : { type : graphql.GraphQLInt },
      format       : { type : graphql.GraphQLJSON }
    })
  });

  return {
    gqlVariableTypeEnum,
    gqlVariable,
    gqlVariableCreate,
    gqlVariableUpdate
  };
};
