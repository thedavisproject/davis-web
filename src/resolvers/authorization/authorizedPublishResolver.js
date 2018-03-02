module.exports = ({
  authorization_rules: {
    allowLoggedInUser
  },
  unprotected_resolver_publish: {
    schedulePublish
  }
}) => {

  return {
    schedulePublish: allowLoggedInUser(schedulePublish)
  };
};
