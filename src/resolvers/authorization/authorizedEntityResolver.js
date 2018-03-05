const model = require('davis-model');
const { user } = model;

module.exports = ({
  authorization_rules: {
    allowAnonymous,
    allowLoggedInUser,
    allowAdmin
  },
  unprotected_resolver_entity: {
    resolveEntityFromId,
    resolveAttributesFromVariable,
    resolveEntityIndividualQuery,
    resolveEntityQuery,
    resolveFolderCreate,
    resolveDataSetCreate,
    resolveVariableCreate,
    resolveAttributeCreate,
    resolveUserCreate,
    resolveFolderUpdate,
    resolveDataSetUpdate,
    resolveVariableUpdate,
    resolveAttributeUpdate,
    resolveUserUpdate,
    resolveEntityDelete
  }
}) => {


  return {
    resolveEntityFromId           : (propertyName, entityType, props) =>
      entityType === user.entityType ?
        allowAdmin(resolveEntityFromId)(propertyName, entityType, props) :
        allowAnonymous(resolveEntityFromId)(propertyName, entityType, props),

    resolveEntityIndividualQuery  : (entityType, args) =>
      entityType === user.entityType ?
        allowAdmin(resolveEntityIndividualQuery)(entityType, args) :
        allowAnonymous(resolveEntityIndividualQuery)(entityType, args),

    resolveEntityQuery            : (entityType, args) =>
      entityType === user.entityType ?
        allowAdmin(resolveEntityQuery)(entityType, args) :
        allowAnonymous(resolveEntityQuery)(entityType, args),

    resolveAttributesFromVariable : allowAnonymous(resolveAttributesFromVariable),

    resolveFolderCreate           : allowLoggedInUser(resolveFolderCreate),
    resolveDataSetCreate          : allowLoggedInUser(resolveDataSetCreate),
    resolveVariableCreate         : allowLoggedInUser(resolveVariableCreate),
    resolveAttributeCreate        : allowLoggedInUser(resolveAttributeCreate),
    resolveUserCreate             : allowAdmin(resolveUserCreate),

    resolveFolderUpdate           : allowLoggedInUser(resolveFolderUpdate),
    resolveDataSetUpdate          : allowLoggedInUser(resolveDataSetUpdate),
    resolveVariableUpdate         : allowLoggedInUser(resolveVariableUpdate),
    resolveAttributeUpdate        : allowLoggedInUser(resolveAttributeUpdate),
    resolveUserUpdate             : allowAdmin(resolveUserUpdate),

    resolveEntityDelete            : (entityType, args) =>
      entityType === user.entityType ?
        allowAdmin(resolveEntityDelete)(entityType, args) :
        allowAnonymous(resolveEntityDelete)(entityType, args)
  };
};
