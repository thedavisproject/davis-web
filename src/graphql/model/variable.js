const model = require('davis-model');
const { dataSet, variable } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entity: { entityFields, entityCreateFields, entityUpdateFields },
  resolver_entity: {
    resolveEntityFromId,
    resolveAttributesFromVariable
  }
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
        resolve: props => resolveEntityFromId('scopedDataSet', dataSet.entityType, props)
      },
      attributes: {
        type : new graphql.GraphQLList(getType('Attribute', registry)),
        resolve: ({id}) => resolveAttributesFromVariable(id)
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
