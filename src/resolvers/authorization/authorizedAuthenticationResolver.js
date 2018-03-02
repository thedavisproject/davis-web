module.exports = ({
  authorization_rules: {
    allowAnonymous
  },
  unprotected_resolver_authentication: {
    resolveLogin,
    resolveUserHasGuiAccess
  }
}) => {

  return {
    resolveLogin            : allowAnonymous(resolveLogin),
    resolveUserHasGuiAccess : allowAnonymous(resolveUserHasGuiAccess)
  };
};
