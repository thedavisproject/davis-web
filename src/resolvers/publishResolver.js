const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  jobQueue,
  publishJob
}) => {

  const schedulePublish = ({ target }) => task2Promise(publishJob.queue({target}, jobQueue));

  return {
    schedulePublish
  };
};
