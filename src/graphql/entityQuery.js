const model = require('davis-model');
const { dataSet, folder, variable, attribute, user, query } = model;
const { getType } = require('./typeRegistry');

module.exports = ({
  graphql,
  resolver_entity: {
    resolveEntityIndividualQuery,
    resolveEntityQuery,
    resolveFolderCreate,
    resolveDataSetCreate,
    resolveVariableCreate,
    resolveAttributeCreate,
    resolveUserCreate,
    resolveFolderUpdate,
    resolveDataSetUpdate,
    resolveVariableUpdate,
    resolveAttributeUpdate,
    resolveUserUpdate,
    resolveEntityDelete
  }
}) => {

  const gqlEntityQueryOptionsSortTypeEnum = registryIgnored => new graphql.GraphQLEnumType({
    name: 'EntityQueryOptionsSortType',
    values: {
      ASCENDING: { value: query.sort.direction.ascending },
      DESCENDING: { value: query.sort.direction.descending }
    }
  });

  const gqlEntityQueryOptionsSort = registry => new graphql.GraphQLInputObjectType({
    name: 'EntityQueryOptionsSort',
    fields: {
      direction: { type: getType('EntityQueryOptionsSortType', registry) },
      property: { type: graphql.GraphQLString }
    }
  });

  const gqlEntityQueryOptions = registry => new graphql.GraphQLInputObjectType({
    name: 'EntityQueryOptions',
    fields: {
      sort: { type: getType('EntityQueryOptionsSort', registry)},
      take: { type: graphql.GraphQLInt },
      skip: { type: graphql.GraphQLInt }
    }
  });

  function entityIndividualGraphQLQuery(gqlType, entityType){
    return {
      type: gqlType,
      args: {
        id: {
          type : new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, args) => resolveEntityIndividualQuery(entityType, args)
    };
  }

  function entityGraphQLQuery(gqlType, entityType, registry){
    return {
      type: new graphql.GraphQLList(gqlType),
      args: {
        query: {
          type : graphql.GraphQLJSON
        },
        options: {
          type: getType('EntityQueryOptions', registry)
        }
      },
      resolve: (_, args) => resolveEntityQuery(entityType, args)
    };
  }

  const gqlEntityQuery = registry => new graphql.GraphQLObjectType({
    name: 'EntityQuery',
    fields: {
      folders: entityGraphQLQuery(getType('Folder', registry), folder.entityType, registry),
      folder: entityIndividualGraphQLQuery(getType('Folder', registry), folder.entityType),
      dataSets: entityGraphQLQuery(getType('DataSet', registry), dataSet.entityType, registry),
      dataSet: entityIndividualGraphQLQuery(getType('DataSet', registry), dataSet.entityType),
      variables: entityGraphQLQuery(getType('Variable', registry), variable.entityType, registry),
      variable: entityIndividualGraphQLQuery(getType('Variable', registry), variable.entityType),
      attributes: entityGraphQLQuery(getType('Attribute', registry), attribute.entityType, registry),
      attribute: entityIndividualGraphQLQuery(getType('Attribute', registry), attribute.entityType),
      users: entityGraphQLQuery(getType('User', registry), user.entityType, registry),
      user: entityIndividualGraphQLQuery(getType('User', registry), user.entityType)
    }
  });

  const entityGraphQLMutate = (gqlInputType, gqlOutputType, parameterName, resolveFn) => {
    const config = {
      type: new graphql.GraphQLList(gqlOutputType),
      args: {},
      resolve: (_, args) => resolveFn(args[parameterName])
    };

    config.args[parameterName] = { type: new graphql.GraphQLList(gqlInputType) };

    return config;
  };

  const gqlEntityCreate = registry => new graphql.GraphQLObjectType({
    name: 'EntityCreate',
    fields: {
      folders: entityGraphQLMutate(
        getType('FolderCreate', registry),
        getType('Folder', registry),
        'folders',
        resolveFolderCreate),

      dataSets: entityGraphQLMutate(
        getType('DataSetCreate', registry),
        getType('DataSet', registry),
        'dataSets',
        resolveDataSetCreate),

      variables: entityGraphQLMutate(
        getType('VariableCreate', registry),
        getType('Variable', registry),
        'variables',
        resolveVariableCreate),

      attributes: entityGraphQLMutate(
        getType('AttributeCreate', registry),
        getType('Attribute', registry),
        'attributes',
        resolveAttributeCreate),

      users: entityGraphQLMutate(
        getType('UserCreate', registry),
        getType('User', registry),
        'users',
        resolveUserCreate)
    }
  });

  const gqlEntityUpdate = registry => new graphql.GraphQLObjectType({
    name: 'EntityUpdate',
    fields: {
      folders: entityGraphQLMutate(
        getType('FolderUpdate', registry),
        getType('Folder', registry),
        'folders',
        resolveFolderUpdate),

      dataSets: entityGraphQLMutate(
        getType('DataSetUpdate', registry),
        getType('DataSet', registry),
        'dataSets',
        resolveDataSetUpdate),

      variables: entityGraphQLMutate(
        getType('VariableUpdate', registry),
        getType('Variable', registry),
        'variables',
        resolveVariableUpdate),

      attributes: entityGraphQLMutate(
        getType('AttributeUpdate', registry),
        getType('Attribute', registry),
        'attributes',
        resolveAttributeUpdate),

      users: entityGraphQLMutate(
        getType('UserUpdate', registry),
        getType('User', registry),
        'users',
        resolveUserUpdate)
    }
  });

  const entityGraphQLDelete = entityType => {
    return {
      type: graphql.GraphQLBoolean,
      args: {
        ids: { type : new graphql.GraphQLList(graphql.GraphQLInt) }
      },
      resolve: (_, args) => resolveEntityDelete(entityType, args)
    };
  };

  const gqlEntityDelete = registryIgnored => new graphql.GraphQLObjectType({
    name: 'EntityDelete',
    fields: {
      folders: entityGraphQLDelete(folder.entityType),
      dataSets: entityGraphQLDelete(dataSet.entityType),
      variables: entityGraphQLDelete(variable.entityType),
      attributes: entityGraphQLDelete(attribute.entityType),
      users: entityGraphQLDelete(user.entityType)
    }
  });

  const gqlEntityMutation = registry => new graphql.GraphQLObjectType({
    name: 'EntityMutation',
    fields: {
      create: { type: getType('EntityCreate', registry), resolve: () => ({}) },
      update: { type: getType('EntityUpdate', registry), resolve: () => ({}) },
      delete: { type: getType('EntityDelete', registry), resolve: () => ({}) }
    }
  });

  return {
    gqlEntityQueryOptionsSortTypeEnum,
    gqlEntityQueryOptionsSort,
    gqlEntityQueryOptions,
    gqlEntityQuery,
    gqlEntityCreate,
    gqlEntityUpdate,
    gqlEntityDelete,
    gqlEntityMutation
  };
};
