module.exports = ({
  authorization_rules: {
    allowAnonymous,
    allowLoggedInUser
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
    resolveFolderUpdate,
    resolveDataSetUpdate,
    resolveVariableUpdate,
    resolveAttributeUpdate,
    resolveEntityDelete
  }
}) => {

  return {
    resolveEntityFromId           : allowAnonymous(resolveEntityFromId),
    resolveAttributesFromVariable : allowAnonymous(resolveAttributesFromVariable),
    resolveEntityIndividualQuery  : allowAnonymous(resolveEntityIndividualQuery),
    resolveEntityQuery            : allowAnonymous(resolveEntityQuery),

    resolveFolderCreate           : allowLoggedInUser(resolveFolderCreate),
    resolveDataSetCreate          : allowLoggedInUser(resolveDataSetCreate),
    resolveVariableCreate         : allowLoggedInUser(resolveVariableCreate),
    resolveAttributeCreate        : allowLoggedInUser(resolveAttributeCreate),
    resolveFolderUpdate           : allowLoggedInUser(resolveFolderUpdate),
    resolveDataSetUpdate          : allowLoggedInUser(resolveDataSetUpdate),
    resolveVariableUpdate         : allowLoggedInUser(resolveVariableUpdate),
    resolveAttributeUpdate        : allowLoggedInUser(resolveAttributeUpdate),
    resolveEntityDelete           : allowLoggedInUser(resolveEntityDelete)
  };
};
