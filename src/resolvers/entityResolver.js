const R = require('ramda');
const model = require('davis-model');
const { dataSet, folder, variable, attribute, user } = model;
const q = model.query.build;
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const shared = require('davis-shared');
const {thread} = shared.fp;
const entityLoaderFactory = require('./entityLoaderFactory');

module.exports = ({
  entityRepository
}) => {

  const entityLoaders = entityLoaderFactory(entityRepository, [
    dataSet.entityType,
    folder.entityType,
    variable.entityType,
    attribute.entityType,
    user.entityType
  ]);

  // Reads
  const resolveEntityFromId = (propertyName, entityType, props) => {
    const id = props[propertyName];
    if(R.isNil(id)){
      return null;
    }
    return entityLoaders[entityType].load(props[propertyName]);
  };

  const resolveAttributesFromVariable = id => task2Promise(entityRepository.query(
    attribute.entityType,
    q.eq('variable', id)));

  const resolveEntityIndividualQuery = (entityType, {id}) => {
    return task2Promise(
      entityRepository.queryById(entityType, [id])
      .map(results => R.isNil(results) || results.length < 1 ? null : results[0]));
  };

  const resolveEntityQuery = (entityType, {query = []}) => {
    return task2Promise(entityRepository.query(entityType, query));
  };

  // Mutations
  const entityCreate = entityType => R.pipe(
    R.map(R.assoc('entityType', entityType)),
    entityRepository.create,
    task2Promise);

  const entityUpdate = entityType => partialEntities =>
    thread(partialEntities,
      // First grab the entities to merge the updates with
      entities => entityRepository.query(
        entityType,
        q.in('id', entities.map(R.prop('id')))),
      // Join with the update fields
      R.map(existingEntities => {
        const indexedPartials = R.indexBy(R.prop('id'), partialEntities);
        return existingEntities.map(e => Object.assign({}, e, indexedPartials[e.id]));
      }),
      R.chain(entityRepository.update),
      task2Promise);

  const applyEntityConstructor = R.curry((ctr, parameterNames, partialEntity) => {
    if(partialEntity.id){
      throw new Error(`Entity ID must not be supplied for CREATE action: ${partialEntity}`);
    }

    const ctrParams = R.props(parameterNames, partialEntity);
    const additionalParams = R.omit(parameterNames, partialEntity);

    const args = [null, ...ctrParams, additionalParams];
    return ctr.apply(null, args);
  });

  // Make the variable constructor generic to type
  const variableCtr = variableType => (id, name, props) =>
    variable.new(id, name, variableType, props);

  // *** Folder ***
  const resolveFolderCreate = R.pipe(
    R.map(applyEntityConstructor(folder.new, ['name'])),
    entityCreate(folder.entityType));

  const resolveFolderUpdate = entityUpdate(folder.entityType);

  // *** Data Set ***
  const resolveDataSetCreate = R.pipe(
    R.map(applyEntityConstructor(dataSet.new, ['name'])),
    entityCreate(dataSet.entityType));

  const resolveDataSetUpdate = entityUpdate(dataSet.entityType);

  // *** Variable ***
  const resolveVariableCreate = partialEntity =>
    thread(partialEntity,
      R.map(applyEntityConstructor(variableCtr(partialEntity.type), ['name'])),
      entityCreate(variable.entityType));

  const resolveVariableUpdate = entityUpdate(variable.entityType);

  // *** Attribute ***
  const resolveAttributeCreate = R.pipe(
    R.map(applyEntityConstructor(attribute.new, ['name', 'variable'])),
    entityCreate(attribute.entityType));

  const resolveAttributeUpdate = entityUpdate(attribute.entityType);

  // *** User ***
  const resolveUserCreate = R.pipe(
    R.map(partialEntity => {
      if(partialEntity.id){
        throw new Error(`Entity ID must not be supplied for CREATE action: ${partialEntity}`);
      }

      return thread(
        user.new(null, partialEntity.name, partialEntity.email),
        user.setPassword(partialEntity.password),
        R.isNil(partialEntity.admin)? R.identity : R.assoc('admin', partialEntity.admin),
        R.isNil(partialEntity.gui)? R.identity : R.assoc('gui', partialEntity.gui));
    }),
    entityCreate(user.entityType));

  const resolveUserUpdate = R.pipe(
    R.map(partialEntity => R.isNil(partialEntity.password) ?
      partialEntity:
      user.setPassword(partialEntity.password, partialEntity)),
    entityUpdate(user.entityType));

  // Delete
  const resolveEntityDelete = (entityType, {ids}) => task2Promise(entityRepository.delete(entityType, ids));

  return {
    resolveEntityFromId,
    resolveAttributesFromVariable,
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
  };
};
