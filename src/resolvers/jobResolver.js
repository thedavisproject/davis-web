
module.exports = ({
  jobQueue
}) => {
  return {
    resolveJob: ({id}) => jobQueue.getJob(id)
  };
};
