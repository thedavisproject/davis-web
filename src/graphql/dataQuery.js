const R = require('ramda');
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
  dataImport,
  individualGenerator: {rawToIndividuals},
  config,
  csvParse
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
      return task2Promise(dataAnalyze(dataSet, csvParse(filePath)));
    }
  });

  const gqlDataImport = registryIgnored => ({
    type: graphql.GraphQLInt,
    args: {
      dataSet: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      fileId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) }
    },
    resolve: (_, {dataSet, fileId}) => {
      const filePath = `${config.upload.path}/${fileId}`;

      return task2Promise(thread(
        rawToIndividuals(dataSet),
        R.chain(toIndividuals =>
          dataImport(
            dataSet,
            csvParse(filePath).pipe(toIndividuals)))));
    }
  });

  return {
    gqlDataQuery,
    gqlDataAnalyze,
    gqlDataImport
  };
};
