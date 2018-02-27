const R = require('ramda');
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const { getType } = require('./typeRegistry');
const model = require('davis-model');
const { user } = model;
const q = model.query.build;
const { crypto } = require('davis-shared');

module.exports = ({
  entityRepository,
  graphql,
  jobQueue,
  publishJob,
  config
}) => {

  const encode = crypto.encode(
    new Buffer(config.crypto.encryptionKey, 'hex'),
    new Buffer(config.crypto.validationKey, 'hex'));

  const getUser = results => results.length > 0 ?
    Task.of(results[0]) :
    Task.rejected('User not found.');

  const validatePassword = R.curry((password, u) =>
    user.comparePassword(password, u) ?
      Task.of(u) :
      Task.rejected('Incorrect password'));

  const generateToken = u => encode({ userId: u.id });

  const login = (email, password) =>
      // Query for the user by email
      entityRepository.query(user.entityType, q.eq('email', email))
        // Validate that a user is returned
        .chain(getUser)
        // Check the password
        .chain(validatePassword(password))
        // Generate an auth token for this user
        .map(generateToken);

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
    login,
    gqlLogin
  };
};
