export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = status === 500 ? "Something went wrong" : err.message;

  if (status === 500) {
    console.error(err);
  }

  return res.status(status).json({ error: { code, message } });
}
