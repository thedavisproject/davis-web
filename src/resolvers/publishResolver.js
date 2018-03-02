const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  user,
  jobQueue,
  publishJob
}) => {

  const schedulePublish = ({ target }) => task2Promise(publishJob.queue({
    userId: user.id,
    target
  }, jobQueue));

  return {
    schedulePublish
  };
};
