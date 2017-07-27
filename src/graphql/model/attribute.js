const model = require('davis-model');
const { variable, attribute } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entity: { entityFields, entityCreateFields, entityUpdateFields },
  graphql_entityResolver: { resolveEntityFromId }
}) => {

  const gqlAttribute = registry => new graphql.GraphQLObjectType({
    name: 'Attribute',
    interfaces: [getType('Entity', registry)],
    fields: () => Object.assign({}, entityFields, {
      // Resolve the variable object from the variable ID
      variable: {
        type: getType('Variable', registry),
        resolve: resolveEntityFromId('variable', variable.entityType)
      },
      key: { type: graphql.GraphQLString },
      parent: {
        type: getType('Attribute', registry),
        resolve: resolveEntityFromId('parent', attribute.entityType)
      }
    })
  });

  const gqlAttributeCreate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'AttributeCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      key      : { type : graphql.GraphQLString },
      variable : { type : graphql.GraphQLInt },
      parent   : { type : graphql.GraphQLJSON }
    })
  });

  const gqlAttributeUpdate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'AttributeUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      key      : { type : graphql.GraphQLString },
      variable : { type : graphql.GraphQLInt },
      parent   : { type : graphql.GraphQLJSON }
    })
  });

  return {
    gqlAttribute,
    gqlAttributeCreate,
    gqlAttributeUpdate
  };
};
