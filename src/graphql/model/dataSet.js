const model = require('davis-model');
const { folder } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entity: { entityFields, entityCreateFields, entityUpdateFields },
  graphql_entityResolver: { resolveEntityFromId }
}) => {

  const gqlDataSet = registry => new graphql.GraphQLObjectType({
    name: 'DataSet',
    interfaces: [getType('Entity', registry)],
    fields: Object.assign({}, entityFields, {
      folder: {
        type : getType('Folder', registry),
        // Resolve the folder object from the folder ID
        resolve: resolveEntityFromId('folder', folder.entityType)
      },
      dataModified : { type : graphql.GraphQLDate },
      schema: { type: graphql.GraphQLJSON }
    })
  });

  const gqlDataSetCreate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'DataSetCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      folder: { type: graphql.GraphQLInt },
      schema: { type: graphql.GraphQLJSON }
    })
  });

  const gqlDataSetUpdate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'DataSetUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      folder: { type: graphql.GraphQLInt },
      schema: { type: graphql.GraphQLJSON }
    })
  });

  return {
    gqlDataSet,
    gqlDataSetCreate,
    gqlDataSetUpdate
  };
};
