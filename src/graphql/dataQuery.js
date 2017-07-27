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
  dataQuery
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

      const filters = isNilOrEmpty(q) ? null :
        thread(q,
        queryString.stringToMap,
        queryString.queryFilters.deSerialize);

      return task2Promise(dataQuery(filters, dataSets));
    }
  });

  return {
    gqlDataQuery
  };
};
