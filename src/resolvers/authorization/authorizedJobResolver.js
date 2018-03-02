module.exports = ({
  authorization_rules: {
    allowLoggedInUser
  },
  unprotected_resolver_job: {
    resolveJob
  }
}) => {

  return {
    resolveJob: allowLoggedInUser(resolveJob)
  };
};
