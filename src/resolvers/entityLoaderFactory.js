const R = require('ramda');
const {thread} = require('davis-shared').fp;
const DataLoader = require('dataloader');
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);

module.exports = (entityRepository, entityTypes) => thread(entityTypes,
  R.map(entityType => ([
    entityType,
    new DataLoader(ids => task2Promise(
      entityRepository.queryById(entityType, ids).map(entities => {
        const indexedEntities = R.indexBy(R.prop('id'), entities);
        return ids.map(R.propOr(null, R.__, indexedEntities));
      })))])),
  R.fromPairs);
