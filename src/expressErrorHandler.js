const R = require('ramda');

module.exports =
  ({
    config
  }) =>
  {
    const { log } = config;

    return {
      handleError: R.curry(function(req, res, error){
        console.log(error);
        log.error({reqest: req, error: error}, 'Error processing request');
        res.status(500).send('Server Error.');
      })
    };
  };
