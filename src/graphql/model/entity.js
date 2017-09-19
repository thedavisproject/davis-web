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
    entityType : { type : graphql.GraphQLString },
    name       : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) }
  };

  const entityUpdateFields = {
    id         : { type : new graphql.GraphQLNonNull(graphql.GraphQLInt) },
    entityType : { type : graphql.GraphQLString },
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

  return {
    entityFields,
    entityCreateFields,
    entityUpdateFields,
    gqlEntity
  };
};
