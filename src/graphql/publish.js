const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const { getType } = require('./typeRegistry');

module.exports = ({
  graphql,
  jobQueue,
  publishJob
}) => {

  const gqlPublish = registry => new graphql.GraphQLObjectType({
    name: 'Publish',
    fields: ({
      site: {
        type: getType('Job', registry),
        args: {
          target: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
        },
        resolve: (_, { target }) => task2Promise(publishJob.queue(target, jobQueue))
      }
    })
  });

  return {
    gqlPublish
  };
};
