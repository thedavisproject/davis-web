module.exports = {
  graphQL: require('./src/graphQL'),
  entityLoaderFactory: require('./src/entityLoaderFactory'),
  fileUploader: require('./src/fileUploader'),
  passport: {
    basic: require('./src/passportBasic')
  }
};
