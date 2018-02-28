const shared = require('davis-shared');
const {thread} = shared.fp;

module.exports = ({
  userAuthentication: {userByToken}
}) => {

  return (req, res, next) => {

    if(req.headers && req.headers.authorization){
      const regex = /^Bearer\s+(\S+)/;
      const match = regex.exec(req.headers.authorization);
      if(match){
        const token = match[1];

        thread(token,
          userByToken,
          results => {
            results.fork(function(errorIgnored) {
              res.status(400);
              return res.send('Authentication error. Bad token.');
            },
              function(user) {
                req.context = req.context || {};
                req.context.user = user;
                return next();
              });
          });
      }
      else{
        res.status(400);
        return res.send('Authentication error. Bad token.');
      }
    }
    else {
      return next();
    }
  };
};
