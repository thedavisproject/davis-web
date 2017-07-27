const model = require('davis-model');
const { dataSet, folder, variable, attribute } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql
}) => {

  const entityFields = {
    entityType : { type : graphql.GraphQLString },
    id         : { type : graphql.GraphQLInt },
    name       : { type : graphql.GraphQLString },
    created    : { type : graphql.GraphQLDate },
    modified   : { type : graphql.GraphQLDate }
  };

  const entityCreateFields = {
    entityType : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) },
    name       : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) }
  };

  const entityUpdateFields = {
    id         : { type : new graphql.GraphQLNonNull(graphql.GraphQLInt) },
    entityType : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) },
    name       : { type : graphql.GraphQLString }
  };

  const gqlEntity = registry => new graphql.GraphQLInterfaceType({
    name: 'Entity',
    fields: entityFields,
    resolveType: function(value){
      if(value.entityType === folder.entityType){
        return getType('Folder', registry);
      }
      if(value.entityType === dataSet.entityType){
        return getType('DataSet', registry);
      }
      if(value.entityType === variable.entityType){
        return getType('Variable', registry);
      }
      if(value.entityType === attribute.entityType){
        return getType('Attribute', registry);
      }
    }
  });

  const gqlEntityCreate = registry => new graphql.GraphQLUnionInputType({
    name: 'EntityCreate',
    inputTypes: [
      getType('FolderCreate', registry),
      getType('DataSetCreate', registry),
      getType('VariableCreate', registry),
      getType('AttributeCreate', registry)
    ],
    typeKey: 'entityType',
    resolveType: function(type){
      if(type === folder.entityType){
        return getType('FolderCreate', registry);
      }
      if(type === dataSet.entityType){
        return getType('DataSetCreate', registry);
      }
      if(type === variable.entityType){
        return getType('VariableCreate', registry);
      }
      if(type === attribute.entityType){
        return getType('AttributeCreate', registry);
      }
    }
  });

  const gqlEntityUpdate = registry => new graphql.GraphQLUnionInputType({
    name: 'EntityUpdate',
    inputTypes: [
      getType('FolderUpdate', registry),
      getType('DataSetUpdate', registry),
      getType('VariableUpdate', registry),
      getType('AttributeUpdate', registry)
    ],
    typeKey: 'entityType',
    resolveType: function(type){
      if(type === folder.entityType){
        return getType('FolderUpdate', registry);
      }
      if(type === dataSet.entityType){
        return getType('DataSetUpdate', registry);
      }
      if(type === variable.entityType){
        return getType('VariableUpdate', registry);
      }
      if(type === attribute.entityType){
        return getType('AttributeUpdate', registry);
      }
    }
  });

  return {
    entityFields,
    entityCreateFields,
    entityUpdateFields,
    gqlEntity,
    gqlEntityCreate,
    gqlEntityUpdate
  };
};
