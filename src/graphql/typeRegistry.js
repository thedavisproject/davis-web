const R = require('ramda');

const newRegistry = () => Object.create(null);

function registerType(type, registry){

  if(Object.prototype.hasOwnProperty.call(registry, type.name)) {
    throw `A GraphQL type with name: ${type.name} is already registered`;
  }

  registry[type.name] = type;

  return registry;
}

exports.newRegistry = newRegistry;

exports.registerTypeFac = R.curry((typeFac, registry) => 
  registerType(typeFac(registry), registry));

exports.getType = R.curry((typeName, registry) => registry[typeName]);

exports.getAllTypes = R.values;
