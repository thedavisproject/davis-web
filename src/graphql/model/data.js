const model = require('davis-model');
const { dataSet, variable, attribute } = model;
const { getType } = require('../typeRegistry');

module.exports = ({
  graphql,
  resolver_entity: { resolveEntityFromId }
}) => {

  const factFields = registry => ({
    variable: {
      type: getType('Variable', registry),
      resolve: props => resolveEntityFromId('variable', variable.entityType, props)
    },
    type: { type: getType('VariableType', registry)}
  });

  const gqlFact = registry => new graphql.GraphQLInterfaceType({
    name: 'Fact',
    fields: factFields(registry),
    resolveType: function(value){
      if(value.type === variable.types.categorical){
        return getType('CategoricalFact', registry);
      }
      if(value.type === variable.types.numerical){
        return getType('NumericalFact', registry);
      }
      if(value.type === variable.types.text){
        return getType('TextFact', registry);
      }
    }
  });

  const gqlCategoricalFact = registry => new graphql.GraphQLObjectType({
    name: 'CategoricalFact',
    interfaces: [getType('Fact', registry)],
    fields: Object.assign({}, factFields(registry), {
      attribute: {
        type: getType('Attribute', registry),
        resolve: props => resolveEntityFromId('attribute', attribute.entityType, props)
      }
    })
  });

  const gqlNumericalFact = registry => new graphql.GraphQLObjectType({
    name: 'NumericalFact',
    interfaces: [getType('Fact', registry)],
    fields: Object.assign({}, factFields(registry), {
      value: {
        type: graphql.GraphQLFloat
      }
    })
  });

  const gqlTextFact = registry => new graphql.GraphQLObjectType({
    name: 'TextFact',
    interfaces: [getType('Fact', registry)],
    fields: Object.assign({}, factFields(registry), {
      value: {
        type: graphql.GraphQLString
      }
    })
  });

  const gqlIndividual = registry => new graphql.GraphQLObjectType({
    name: 'Individual',
    fields:{
      id: {
        type: graphql.GraphQLInt
      },
      facts: {
        type: new graphql.GraphQLList(getType('Fact', registry))
      }
    }
  });

  const gqlDataImportColumnMapping = registryIgnored => new graphql.GraphQLInputObjectType({
    name: 'DataImportColumnMapping',
    fields: {
      column   : { type : new graphql.GraphQLNonNull(graphql.GraphQLString) },
      variable : { type : new graphql.GraphQLNonNull(graphql.GraphQLInt) }
    }
  });

  const gqlDataSetQueryResults = registry => new graphql.GraphQLObjectType({
    name: 'DataSetQueryResults',
    fields: {
      dataSet:{
        type: getType('DataSet', registry),
        resolve: props => resolveEntityFromId('dataSet', dataSet.entityType, props)
      },
      data: {
        type: new graphql.GraphQLList(getType('Individual', registry))
      }
    }
  });

  return {
    gqlFact,
    gqlCategoricalFact,
    gqlNumericalFact,
    gqlTextFact,
    gqlIndividual,
    gqlDataSetQueryResults,
    gqlDataImportColumnMapping
  };
};
