module.exports = ({
  graphql,
  resolver_authentication: {
    resolveLogin,
    resolveUserHasGuiAccess
  }
}) => {

  const gqlLogin = {
    type: graphql.GraphQLString,
    args: {
      email: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )},
      password: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
    },
    resolve: (_, args) => resolveLogin(args)
  };

  const gqlUserHasGuiAccess = {
    type: graphql.GraphQLBoolean,
    args: {
      token: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
    },
    resolve: (_, args) => resolveUserHasGuiAccess(args)
  };

  const gqlAuthenticationQuery = registryIgnored => new graphql.GraphQLObjectType({
    name: 'AuthenticationQuery',
    fields: {
      hasGuiAccess: gqlUserHasGuiAccess
    }
  });

  const gqlAuthenticationMutation = registryIgnored => new graphql.GraphQLObjectType({
    name: 'AuthenticationMutation',
    fields: {
      login: gqlLogin
    }
  });

  return {
    gqlAuthenticationQuery,
    gqlAuthenticationMutation
  };
};
