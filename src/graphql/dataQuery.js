const { getType } = require('./typeRegistry');

module.exports = ({
  graphql,
  resolver_data: {
    resolveDataQuery,
    resolveDataAnalyze,
    resolveDataAnalyzeColumn,
    resolveDataImport,
    resolveDataDelete
  }
}) => {

  const gqlDataQuery = registry => ({
    type: new graphql.GraphQLList(getType('DataSetQueryResults', registry)),
    args: {
      dataSets: {
        type: new graphql.GraphQLList(graphql.GraphQLInt),
        defaultValue: []
      },
      q: {
        type: graphql.GraphQLString,
        defaultValue: ''
      },
      limit: {
        type: graphql.GraphQLInt
      }
    },
    resolve: (_, args) => resolveDataQuery(args)
  });

  const gqlDataAnalyze = registry => ({
    type: new graphql.GraphQLList(getType('VariableMatch', registry)),
    args: {
      dataSet: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      fileId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      valueLimit: {
        type: graphql.GraphQLInt,
        defaultValue: 0
      }
    },
    resolve: (_, args) => resolveDataAnalyze(args)
  });

  const gqlDataAnalyzeColumn = registry => ({
    type: getType('VariableMatch', registry),
    args: {
      dataSet: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      fileId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      column: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      valueLimit: {
        type: graphql.GraphQLInt,
        defaultValue: 0
      }
    },
    resolve: (_, args) => resolveDataAnalyzeColumn(args)
  });

  const gqlDataImport = registry => ({
    type: getType('Job', registry),
    args: {
      dataSet: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      fileId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
      columnMappings: { type: new graphql.GraphQLNonNull(
        new graphql.GraphQLList(getType('DataImportColumnMapping', registry))) },
      createMissingAttributes: {
        type: graphql.GraphQLBoolean,
        defaultValue: false
      }
    },
    resolve: (_, args) => resolveDataImport(args)
  });

  const gqlDataDelete = registryIgnored => ({
    type: graphql.GraphQLBoolean,
    args: {
      dataSet: {
        type: new graphql.GraphQLList(graphql.GraphQLInt),
        defaultValue: []
      },
      variable: {
        type: new graphql.GraphQLList(graphql.GraphQLInt),
        defaultValue: []
      },
      attribute: {
        type: new graphql.GraphQLList(graphql.GraphQLInt),
        defaultValue: []
      }
    },
    resolve: (_, args) => resolveDataDelete(args)
  });

  const gqlDataQueries = registry => new graphql.GraphQLObjectType({
    name: 'DataQuery',
    fields: {
      query: gqlDataQuery(registry),
      analyze: gqlDataAnalyze(registry),
      analyzeColumn: gqlDataAnalyzeColumn(registry)
    }
  });

  const gqlDataMutation = registry => new graphql.GraphQLObjectType({
    name: 'DataMutation',
    fields: {
      import: gqlDataImport(registry),
      delete: gqlDataDelete(registry)
    }
  });

  return {
    gqlDataQueries,
    gqlDataMutation
  };
};
