const model = require('davis-model');
const { variable, attribute } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  resolver_entity: { resolveEntityFromId }
}) => {

  const gqlValueMatch = registry => new graphql.GraphQLObjectType({
    name: 'ValueMatch',
    fields: () => ({
      value: { type: graphql.GraphQLString },
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
      values: {
        type: new graphql.GraphQLList(getType('ValueMatch', registry))
      }
    })
  });


  return {
    gqlValueMatch,
    gqlVariableMatch
  };
};
