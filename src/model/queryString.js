const { head, tail, isNil, any, isEmpty, match, merge, toPairs,
        pipe, map } = require('ramda'),
  { variable } = require('davis-model');

const _comparators = ['<', '<=', '=', '>=', '>'];

const _parseKey = function(key){
  
  const typeCharacter = head(key),
    variableId = tail(key);

  const variableType = 
    typeCharacter === 'c' ?
      variable.types.categorical :
    typeCharacter === 'q' ?
      variable.types.quantitative :
      null;

  // Validate key
  if(isNil(variableType)){
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

const _parseCategoricalValue = function(value){
  
  if(isEmpty(value)){
    return {
      attributes: []
    };
  }

  const parts = value.split(',');
  if(any(isNaN, parts)){
    throw `Invalid attribute IDs for categorical variable: ${value}`;
  }
  return {
    attributes: parts.map(x => +x)
  };
};

const _parseQuantitativeValue = function(value){
  
  const comparatorMatch = _comparators.join('|'),
    matchExp = new RegExp(`^(${comparatorMatch})(.*)`);

  const groups = match(matchExp, value);

  if(groups.length === 0){
    throw `Invalid query value for quantitative variable: ${value}`;
  }

  return {
    value: +groups[2],
    comparator: groups[1]
  };
};

const _parseKeyValuePair = function(key, value){

  const parsedKey = _parseKey(key),
    parsedValue = parsedKey.type === variable.types.categorical ?
      _parseCategoricalValue(value) :
      _parseQuantitativeValue(value);

  return merge(parsedKey, parsedValue);
};

module.exports = {
  queryFilters: {
    deSerialize: pipe(
      toPairs,
      map(([k, v]) => _parseKeyValuePair(k, v)))
  }
};
