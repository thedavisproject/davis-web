const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = ({
  graphql,
  publish
}) => {

  const gqlPublish = registryIgnored => new graphql.GraphQLObjectType({
    name: 'Publish',
    fields: ({
      site: {
        type: graphql.GraphQLBoolean,
        args: {
          target: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
        },
        resolve: (_, { target }) => task2Promise(publish(target))
      }
    })
  });

  return {
    gqlPublish
  };
};
