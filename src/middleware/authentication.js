const BearerStrategy = require('passport-http-bearer');
const shared = require('davis-shared');
const {crypto, fp} = shared;
const {either2Task, thread} = fp;
const model = require('davis-model');
const { user } = model;
const R = require('ramda');

module.exports = ({
  entityRepository,
  config
}) => {

  const decode = crypto.decode(config.crypto.encryptionKey, config.crypto.validationKey);

  return (req, res, next) => {

    if(req.headers && req.headers.authorization){
      const regex = /^Bearer\s+(\S+)/;
      const match = regex.exec(req.headers.authorization);
      if(match){
        const token = match[1];

        thread(token,
          decode,
          either2Task,
          R.chain(({userId}) => entityRepository.queryById(user.entityType, userId)),
          results => {
            results.fork(function(error) {
              res.status(400);
              res.send('Authentication error. Bad token.');
            },
              function(users) {

                if (users.length === 0) {
                  // TODO: Log bad user error
                  res.status(400);
                  res.send('Authentication error. Bad token.');
                }

                req.context = {
                  user: users[0]
                };
              });
          });
      }
    }
    next();
  };
};
