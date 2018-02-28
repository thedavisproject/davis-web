const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  graphql,
  userAuthentication: {login}
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

  return {
    gqlLogin
  };
};
