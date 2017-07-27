const R = require('ramda');
const model = require('davis-model');
const { dataSet, folder, variable, attribute } = model;

module.exports = ({
  graphql_entityLoaderFactory: entityLoaderFactory
}) => {

  const entityLoaders = entityLoaderFactory([
    dataSet.entityType,
    folder.entityType,
    variable.entityType,
    attribute.entityType
  ]);

  const resolveEntityFromId = (propertyName, entityType) =>
    props => {
      const id = props[propertyName];
      if(R.isNil(id)){
        return null;
      }
      return entityLoaders[entityType].load(props[propertyName]); 
    };

  return {
    resolveEntityFromId
  };
};
