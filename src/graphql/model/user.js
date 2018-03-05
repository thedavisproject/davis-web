const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entity: { entityFields, entityCreateFields, entityUpdateFields }
}) => {

  const gqlUser = registry => new graphql.GraphQLObjectType({
    name: 'User',
    interfaces: [getType('Entity', registry)],
    fields: () => Object.assign({}, entityFields, {
      email: { type: graphql.GraphQLString },
      admin: { type: graphql.GraphQLBoolean },
      gui: { type: graphql.GraphQLBoolean }
    })
  });

  const gqlUserCreate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'UserCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      email: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      password: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      admin: { type: graphql.GraphQLBoolean },
      gui: { type: graphql.GraphQLBoolean }
    })
  });

  const gqlUserUpdate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'UserUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      email: { type: graphql.GraphQLString },
      password: { type: graphql.GraphQLString },
      admin: { type: graphql.GraphQLBoolean },
      gui: { type: graphql.GraphQLBoolean }
    })
  });

  return {
    gqlUser,
    gqlUserCreate,
    gqlUserUpdate
  };
};
