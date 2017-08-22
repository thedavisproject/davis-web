const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  jobQueue
}) => {

  const gqlJob = registryIgnored => new graphql.GraphQLObjectType({
    name: 'Job',
    fields: {
      id: { type: graphql.GraphQLString },
      name: { type: graphql.GraphQLString },
      timestamp: {
        type: graphql.GraphQLDate,
        resolve: ({timestamp}) => new Date(timestamp)
      },
      processedOn: {
        type: graphql.GraphQLDate,
        resolve: ({processedOn}) => new Date(processedOn)
      },
      finishedOn: {
        type: graphql.GraphQLDate,
        resolve: ({finishedOn}) => new Date(finishedOn)
      },
      failedReason: { type: graphql.GraphQLString },
      attemptsMade: { type : graphql.GraphQLInt },
      data: { type: graphql.GraphQLJSON },
      returnvalue: { type: graphql.GraphQLJSON }
    }
  });

  const gqlGetJob = registry => ({
    type: getType('Job', registry),
    args: {
      id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) }
    },
    resolve: (_, { id }) => jobQueue.getJob(id)
  });

  const gqlJobQueries = registry => new graphql.GraphQLObjectType({
    name: 'JobQuery',
    fields: {
      getJob: gqlGetJob(registry)
    }
  });

  return {
    gqlJob,
    gqlJobQueries
  };
};
