const R = require('ramda');
const { variable } = require('davis-model');

const comparators = ['<', '<=', '=', '>=', '>'];

const parseKey = function(key){
  
  const typeCharacter = R.head(key),
    variableId = R.tail(key);

  const variableType = 
    typeCharacter === 'c' ?
      variable.types.categorical :
    typeCharacter === 'n' ?
      variable.types.numerical :
    typeCharacter === 't' ?
      variable.types.text :
      null;

  // Validate key
  if(R.isNil(variableType)){
    throw `Invalid variable key: ${key}. Must begin with 'c' or 'q'.`;
  }

  if(isNaN(variableId)){
    throw `Invalid variable ID: ${variableId}.`;
  }

  return {
    variable: +variableId,
    type: variableType      
  };
};

const parseCategoricalValue = function(value){
  
  if(R.isEmpty(value)){
    return {
      attributes: []
    };
  }

  const parts = value.split(',');
  if(R.any(isNaN, parts)){
    throw `Invalid attribute IDs for categorical variable: ${value}`;
  }
  return {
    attributes: parts.map(x => +x)
  };
};

const parseNumericalValue = function(value){
  
  const comparatorMatch = comparators.join('|'),
    matchExp = new RegExp(`^(${comparatorMatch})(.*)`);

  const groups = R.match(matchExp, value);

  if(groups.length === 0){
    throw `Invalid query value for numerical variable: ${value}`;
  }

  return {
    value: +groups[2],
    comparator: groups[1]
  };
};

const parseTextValue = function(value){
  
  if(!value || R.isEmpty(value)){
    return {
      value: ''
    };
  }

  return {
    value
  };
};

const parseKeyValuePair = function(key, value){

  const parsedKey = parseKey(key);

  const parsedValue = 
    parsedKey.type === variable.types.categorical ?
      parseCategoricalValue(value) :
    parsedKey.type === variable.types.numerical ?
      parseNumericalValue(value) : 
    parsedKey.type === variable.types.text ?
      parseTextValue(value) : 
      null;

  return R.merge(parsedKey, parsedValue);
};

module.exports = {
  queryFilters: {
    deSerialize: R.pipe(
      R.toPairs,
      R.map(([k, v]) => parseKeyValuePair(k, v)))
  },
  stringToMap: R.pipe(
    R.split('&'),
    R.filter(R.complement(R.isEmpty)),
    R.map(R.split('=')),
    R.map(([key, value]) => ({
      key, value
    })),
    R.groupBy(R.prop('key')),
    R.map(R.map(R.prop('value'))),
    R.map(v => v.length === 1 ? v[0] : v))
};
