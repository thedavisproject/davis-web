const model = require('davis-model');
const { folder } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entity: { entityFields, entityCreateFields, entityUpdateFields },
  resolver_entity: { resolveEntityFromId }
}) => {

  const gqlFolder = registry => new graphql.GraphQLObjectType({
    name: 'Folder',
    interfaces: [getType('Entity', registry)],
    fields: () => {
      return Object.assign({}, entityFields, {
        parent: {
          type : getType('Folder', registry),
          resolve: props => resolveEntityFromId('parent', folder.entityType, props)
        }
      });
    }
  });

  const gqlFolderCreate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'FolderCreate',
    fields: () => Object.assign({}, entityCreateFields, {
      parent: { type: graphql.GraphQLInt }
    })
  });

  const gqlFolderUpdate = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'FolderUpdate',
    fields: () => Object.assign({}, entityUpdateFields, {
      parent: { type: graphql.GraphQLInt }
    })
  });

  return {
    gqlFolder,
    gqlFolderCreate,
    gqlFolderUpdate
  };
};
