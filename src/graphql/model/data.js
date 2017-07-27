const model = require('davis-model');
const { dataSet, variable, attribute } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  graphql_entityResolver: { resolveEntityFromId }
}) => {

  const factFields = registry => ({
    variable: {
      type: getType('Variable', registry),
      resolve: resolveEntityFromId('variable', variable.entityType)
    },
    type: {
      type: graphql.GraphQLInt
    }
  });

  const gqlFact = registry => new graphql.GraphQLInterfaceType({
    name: 'Fact',
    fields: factFields(registry),
    resolveType: function(value){
      if(value.type === variable.types.categorical){
        return getType('CategoricalFact', registry);
      }
      if(value.type === variable.types.quantitative){
        return getType('QuantitativeFact', registry);
      }
    }
  });

  const gqlCategoricalFact = registry => new graphql.GraphQLObjectType({
    name: 'CategoricalFact',
    interfaces: [getType('Fact', registry)],
    fields: Object.assign({}, factFields(registry), {
      attribute: {
        type: getType('Attribute', registry),
        resolve: resolveEntityFromId('attribute', attribute.entityType)
      }
    })
  });

  const gqlQuantitativeFact = registry => new graphql.GraphQLObjectType({
    name: 'QuantitativeFact',
    interfaces: [getType('Fact', registry)],
    fields: Object.assign({}, factFields(registry), {
      value: {
        type: graphql.GraphQLFloat
      }
    })
  });

  const gqlIndividual = registry => new graphql.GraphQLObjectType({
    name: 'Individual',
    fields:{
      id: {
        type: graphql.GraphQLInt
      },
      dataSet: {
        type: getType('DataSet', registry),
        resolve: resolveEntityFromId('dataSet', dataSet.entityType)
      },
      facts: {
        type: new graphql.GraphQLList(getType('Fact', registry))
      }
    }
  });

  const gqlDataSetQueryResults = registry => new graphql.GraphQLObjectType({
    name: 'DataSetQueryResults',
    fields: {
      dataSet:{
        type: getType('DataSet', registry),
        resolve: resolveEntityFromId('dataSet', dataSet.entityType)
      },
      data: {
        type: new graphql.GraphQLList(getType('Individual', registry))
      }
    }
  });

  return {
    gqlFact,
    gqlCategoricalFact,
    gqlQuantitativeFact,
    gqlIndividual,
    gqlDataSetQueryResults
  };
};
