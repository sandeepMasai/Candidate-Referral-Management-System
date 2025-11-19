const errorHandler = (err, _req, res, _next) => {
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

