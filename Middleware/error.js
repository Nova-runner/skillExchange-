function errorHandler(err, req, res, next) {
  console.error(err.stack || err);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  if (req.accepts('html')) {
    return res.status(status).send(`<h1>Error ${status}</h1><p>${message}</p><a href="/">Go Home</a>`);
  }
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
