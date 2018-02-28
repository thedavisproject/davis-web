const { queryFilters } = require('./queryString');
const Archiver = require('archiver');

module.exports = ({
  csvExport,
  expressErrorHandler:  { handleError }
}) => {

  return (req, res) => {

    const dataSetIds = req.params.dataSetIds.split(',').map(x => +x);
    const resolvedFilters = queryFilters.deSerialize(req.query);

    csvExport.export(resolvedFilters, dataSetIds).fork(
      handleError(req, res),
      function(results){

        res.writeHead(200, {
          'Content-Type': 'application/zip',
          'Content-disposition': 'attachment; filename=export.zip'
        });

        var zip = Archiver('zip');
        zip.pipe(res);

        results.forEach(set => {
          zip.append(set.csv, { name: `${set.dataSet.name}.csv` });
        });
        zip.finalize();
      });
  };
};
