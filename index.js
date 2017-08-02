module.exports = {
  graphql: {
    entityLoaderFactory: require('./src/graphql/entityLoaderFactory'),
    entityResolver: require('./src/graphql/entityResolver'),
    typeRegistry: require('./src/graphql/typeRegistry'),
    model: {
      entity: require('./src/graphql/model/entity'),
      folder: require('./src/graphql/model/folder'),
      dataSet: require('./src/graphql/model/dataSet'),
      variable: require('./src/graphql/model/variable'),
      attribute: require('./src/graphql/model/attribute'),
      data: require('./src/graphql/model/data'),
      import: require('./src/graphql/model/import')
    },
    entityQuery: require('./src/graphql/entityQuery'),
    dataQuery: require('./src/graphql/dataQuery')
  },
  fileUploader: require('./src/fileUploader'),
  dataExport: require('./src/dataExport'),
  expressErrorHandler: require('./src/expressErrorHandler'),
  passport: {
    basic: require('./src/passportBasic')
  }
};
