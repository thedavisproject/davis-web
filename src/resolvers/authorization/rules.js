const when = require('when');

module.exports = ({
  user
}) => {

  class AuthorizationError extends Error {
    constructor(message){
      super(message);
      this.message = message || 'User not authorized';
      Error.captureStackTrace(this, AuthorizationError);
    }
  }

  const allowAnonymousRule = () => when.resolve();

  const allowLoggedInUserRule = () => user ?
    when.resolve() :
    when.reject(new AuthorizationError());

  const allowAdminRule = () => user && user.admin ?
    when.resolve() :
    when.reject(new AuthorizationError());

  const applyRuleToPromiseReturningFunction = rule => fn => (...args) =>
    rule().then(() => fn.apply(null, args));

  return {
    // Rules
    allowAnonymousRule,
    allowLoggedInUserRule,
    allowAdminRule,

    // Applied
    allowAnonymous    : applyRuleToPromiseReturningFunction(allowAnonymousRule),
    allowLoggedInUser : applyRuleToPromiseReturningFunction(allowLoggedInUserRule),
    allowAdmin        : applyRuleToPromiseReturningFunction(allowAdminRule)
  };
};
