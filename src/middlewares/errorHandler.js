function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION', message: 'El cuerpo debe ser JSON válido' },
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      ok: false,
      error: { code: 'VALIDATION', message: err.message },
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      ok: false,
      error: { code: 'DUPLICATE', message: 'Ya existe un registro con ese valor' },
    });
  }

  console.error(err.name);
  return res.status(500).json({
    ok: false,
    error: { code: 'SERVER_ERROR', message: 'Error interno del servidor' },
  });
}

module.exports = errorHandler;