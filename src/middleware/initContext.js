module.exports = (req, res, next) => {
  req.context = req.context || {};
  next();
};
