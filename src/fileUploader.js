module.exports = ({
  config
}) => {

  const upload = require('multer')({
    dest: config.upload.path
  });

  return (route, app) => {

    app.post(route,
      upload.any(),
      function(req, res){
        
        if(req.files.length < 1){
          res.status(400).send('Error: No file attached');
        }

        const fileStats = req.files[0];

        res.send({
          id: fileStats.filename,
          name: fileStats.originalname,
          mimetype: fileStats.mimetype,
          size: fileStats.size
        });
      });
  };
};
