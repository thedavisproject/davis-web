const R = require('ramda');
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const shared = require('davis-shared');
const {thread} = shared.fp;
const {isNilOrEmpty} = shared.string;
const queryString = require('../queryString');

module.exports = ({
  user,
  dataQuery,
  dataAnalyze,
  dataDelete,
  jobQueue,
  importJob,
  config,
  parseDataFile
}) => {

  const resolveDataQuery = ({dataSets, q}) => {

    const filters = isNilOrEmpty(q) ? [] :
      thread(q,
        queryString.stringToMap,
        queryString.queryFilters.deSerialize);

    return task2Promise(dataQuery(filters, dataSets));
  };

  const resolveDataAnalyze = ({dataSet, fileId, valueLimit}) => {
    const filePath = `${config.upload.path}/${fileId}`;
    return task2Promise(dataAnalyze(dataSet, parseDataFile(filePath), { limit: valueLimit}));
  };

  const resolveDataAnalyzeColumn = ({dataSet, fileId, column, valueLimit}) => {
    const filePath = `${config.upload.path}/${fileId}`;
    return task2Promise(
      dataAnalyze(dataSet, parseDataFile(filePath), {column, limit: valueLimit}).map(r => r[0]));
  };

  const resolveDataImport = ({dataSet, columnMappings, fileId, createMissingAttributes}) => {
    const filePath = `${config.upload.path}/${fileId}`;

    const mappingsAsMap = thread(columnMappings,
      R.indexBy(R.prop('column')),
      R.map(m => m.variable));

    return task2Promise(importJob.queue({
      userId: user.id,
      dataSet,
      columnMappings: mappingsAsMap,
      filePath,
      createMissingAttributes
    }, jobQueue));
  };

  const resolveDataDelete = (filters) => task2Promise(dataDelete(filters));

  return {
    resolveDataQuery,
    resolveDataAnalyze,
    resolveDataAnalyzeColumn,
    resolveDataImport,
    resolveDataDelete
  };
};
