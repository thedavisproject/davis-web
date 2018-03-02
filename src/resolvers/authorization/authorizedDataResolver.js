module.exports = ({
  authorization_rules: {
    allowAnonymous,
    allowLoggedInUser
  },
  unprotected_resolver_data: {
    resolveDataQuery,
    resolveDataAnalyze,
    resolveDataAnalyzeColumn,
    resolveDataImport,
    resolveDataDelete
  }
}) => {

  return {
    resolveDataQuery         : allowAnonymous(resolveDataQuery),
    resolveDataAnalyze       : allowLoggedInUser(resolveDataAnalyze),
    resolveDataAnalyzeColumn : allowLoggedInUser(resolveDataAnalyzeColumn),
    resolveDataImport        : allowLoggedInUser(resolveDataImport),
    resolveDataDelete        : allowLoggedInUser(resolveDataDelete)
  };
};
