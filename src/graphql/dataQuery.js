const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const { getType } = require('./typeRegistry');
const shared = require('davis-shared');
const {thread} = shared.fp;
const {isNilOrEmpty} = shared.string;
const queryString = require('../queryString');

module.exports = ({
  graphql,
  dataQuery,
  dataAnalyze,
  dataDelete,
  jobQueue,
  importJob,
  config,
  parseDataFile
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
      }
    },
    resolve: (_, {dataSets, q}) => {

      const filters = isNilOrEmpty(q) ? [] :
        thread(q,
        queryString.stringToMap,
        queryString.queryFilters.deSerialize);

      return task2Promise(dataQuery(filters, dataSets));
    }
  });

  const gqlDataAnalyze = registry => ({
    type: new graphql.GraphQLList(getType('VariableMatch', registry)),
    args: {
      dataSet: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      fileId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) }
    },
    resolve: (_, {dataSet, fileId}) => {
      const filePath = `${config.upload.path}/${fileId}`;
      return task2Promise(dataAnalyze(dataSet, parseDataFile(filePath)));
    }
  });

  const gqlDataImport = registry => ({
    type: getType('Job', registry),
    args: {
      dataSet: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      fileId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) }
    },
    resolve: (_, {dataSet, fileId}) => {
      const filePath = `${config.upload.path}/${fileId}`;

      return task2Promise(importJob.queue(dataSet, filePath, jobQueue));
    }
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
    resolve: (_, filters) => task2Promise(dataDelete(filters))
  });

  const gqlDataQueries = registry => new graphql.GraphQLObjectType({
    name: 'DataQuery',
    fields: {
      query: gqlDataQuery(registry),
      analyze: gqlDataAnalyze(registry)
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
