const R = require('ramda');
const model = require('davis-model');
const { dataSet, folder, variable, attribute } = model;
const q = model.query.build;
const Task = require('data.task');
const Async = require('control.async')(Task);
const when = require('when');
const task2Promise = Async.toPromise(when.promise);
const shared = require('davis-shared');
const {thread} = shared.fp;

module.exports = ({
  entityRepository,
  resolver_entityLoaderFactory: entityLoaderFactory
}) => {

  const entityLoaders = entityLoaderFactory([
    dataSet.entityType,
    folder.entityType,
    variable.entityType,
    attribute.entityType
  ]);

  // Reads
  const resolveEntityFromId = (propertyName, entityType) =>
    props => {
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
  const entityMutate = mutateFn => entityType => R.pipe(
    R.map(R.assoc('entityType', entityType)),
    mutateFn,
    task2Promise);

  const entityCreate = entityMutate(entityRepository.create);
  const entityUpdate = entityMutate(entityRepository.update);

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
    resolveFolderUpdate,
    resolveDataSetUpdate,
    resolveVariableUpdate,
    resolveAttributeUpdate,
    resolveEntityDelete
  };
};
