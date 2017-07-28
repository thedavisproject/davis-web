const model = require('davis-model');
const { variable, attribute } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entityResolver: { resolveEntityFromId }
}) => {

  const gqlAttributeMatch = registry => new graphql.GraphQLObjectType({
    name: 'AttributeMatch',
    fields: () => ({
      key: { type: graphql.GraphQLString },
      match: { type: graphql.GraphQLBoolean }, 
      attribute: {
        type: getType('Attribute', registry),
        resolve: resolveEntityFromId('attribute', attribute.entityType)
      }
    })
  });

  const gqlVariableMatch = registry => new graphql.GraphQLObjectType({
    name: 'VariableMatch',
    fields: () => ({
      key: { type: graphql.GraphQLString },
      match: { type: graphql.GraphQLBoolean }, 
      variable: {
        type: getType('Variable', registry),
        resolve: resolveEntityFromId('variable', variable.entityType)
      },
      attributes: {
        type: new graphql.GraphQLList(getType('AttributeMatch', registry))
      }
    })
  });


  return {
    gqlAttributeMatch,
    gqlVariableMatch
  };
};
