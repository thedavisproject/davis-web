const { getType } = require('./typeRegistry');

module.exports = ({
  graphql,
  resolver_publish: {schedulePublish}
}) => {

  const gqlPublish = registry => new graphql.GraphQLObjectType({
    name: 'Publish',
    fields: ({
      site: {
        type: getType('Job', registry),
        args: {
          target: { type: new graphql.GraphQLNonNull(graphql.GraphQLString )}
        },
        resolve: (_, args) => schedulePublish(args)
      }
    })
  });

  return {
    gqlPublish
  };
};
