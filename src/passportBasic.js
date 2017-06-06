const BasicStrategy = require('passport-http').BasicStrategy;
const model = require('davis-model');
const { user } = model;
const q = model.query.build;

module.exports = ({
  entityRepository
}) => {

  return function(passport) {

    passport.use('basic', new BasicStrategy(function(email, password, done) {

      entityRepository.query(user.entityType, q.eq('email', email))
        .fork(function(error) {
          // TODO: Add logging back in
          //log.error({
            //user: email,
            //error: error
          //}, 'Error locating user record');
          return done(Error(error));
        },
        function(users) {

          if (users.length === 0) {
            return done(null, false, {
              message: 'Incorrect username.'
            });
          }

          const u = users[0];

          if (!u.comparePassword(password)) {
            return done(null, false, {
              message: 'Incorrect password.'
            });
          }

          return done(null, u);
        });
    }));
  };
};
