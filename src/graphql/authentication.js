const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  graphql,
  userAuthentication: {login, userByToken}
}) => {

  const gqlLogin = {
    type: graphql.GraphQLString,
    args: {
      email: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )},
      password: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
    },
    resolve: (_, { email, password }) =>
      task2Promise(login(email, password))
  };

  const gqlUserHasGuiAccess = {
    type: graphql.GraphQLBoolean,
    args: {
      token: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
    },
    resolve: (_, { token }) =>
      task2Promise(userByToken(token)
        .map(u => u.admin || u.gui))
  };

  const gqlAuthentication = registry => new graphql.GraphQLObjectType({
    name: 'Authentication',
    fields: {
      login: gqlLogin,
      hasGuiAccess: gqlUserHasGuiAccess
    }
  });
  return {
    gqlAuthentication
  };
};
