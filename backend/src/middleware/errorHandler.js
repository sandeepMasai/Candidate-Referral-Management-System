const errorHandler = (err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    status: err.status,
    code: err.code,
  });

  const status = err.status || err.statusCode || 500;
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: 'Validation error',
      errors: messages,
    });
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate entry. This candidate already exists.',
    });
  }

  res.status(status).json({
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      name: err.name,
      code: err.code,
    }),
  });
};

export default errorHandler;

