const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  userAuthentication: {login, userByToken}
}) => {

  const resolveLogin = ({email, password}) =>
    task2Promise(login(email, password));

  const resolveUserHasGuiAccess = ({token}) =>
    task2Promise(userByToken(token)
      .map(u => u.admin || u.gui));

  return {
    resolveLogin,
    resolveUserHasGuiAccess
  };
};
