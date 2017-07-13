const R = require('ramda');
const { variable } = require('davis-model');

const comparators = ['<', '<=', '=', '>=', '>'];

const parseKey = function(key){
  
  const typeCharacter = R.head(key),
    variableId = R.tail(key);

  const variableType = 
    typeCharacter === 'c' ?
      variable.types.categorical :
    typeCharacter === 'q' ?
      variable.types.quantitative :
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

const parseQuantitativeValue = function(value){
  
  const comparatorMatch = comparators.join('|'),
    matchExp = new RegExp(`^(${comparatorMatch})(.*)`);

  const groups = R.match(matchExp, value);

  if(groups.length === 0){
    throw `Invalid query value for quantitative variable: ${value}`;
  }

  return {
    value: +groups[2],
    comparator: groups[1]
  };
};

const parseKeyValuePair = function(key, value){

  const parsedKey = parseKey(key),
    parsedValue = parsedKey.type === variable.types.categorical ?
      parseCategoricalValue(value) :
      parseQuantitativeValue(value);

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
