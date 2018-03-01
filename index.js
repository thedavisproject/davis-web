module.exports = {
  graphql: {
    typeRegistry: require('./src/graphql/typeRegistry'),
    model: {
      entity: require('./src/graphql/model/entity'),
      folder: require('./src/graphql/model/folder'),
      dataSet: require('./src/graphql/model/dataSet'),
      variable: require('./src/graphql/model/variable'),
      attribute: require('./src/graphql/model/attribute'),
      data: require('./src/graphql/model/data'),
      import: require('./src/graphql/model/import'),
      job: require('./src/graphql/model/bullJob')
    },
    authentication: require('./src/graphql/authentication'),
    dataQuery: require('./src/graphql/dataQuery'),
    entityQuery: require('./src/graphql/entityQuery'),
    publish: require('./src/graphql/publish')
  },
  resolvers: {
    authenticationResolver: require('./src/resolvers/authenticationResolver'),
    dataResolver: require('./src/resolvers/dataResolver'),
    entityLoaderFactory: require('./src/resolvers/entityLoaderFactory'),
    entityResolver: require('./src/resolvers/entityResolver'),
    jobResolver: require('./src/resolvers/jobResolver'),
    publishResolver: require('./src/resolvers/publishResolver')
  },
  fileUploader: require('./src/fileUploader'),
  dataExport: require('./src/dataExport'),
  expressErrorHandler: require('./src/expressErrorHandler'),
  middleware: {
    initContext: require('./src/middleware/initContext'),
    authentication: require('./src/middleware/authentication')
  }
};
