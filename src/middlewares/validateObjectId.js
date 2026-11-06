const { isObjectIdOrHexString } = require('mongoose');

function validateObjectId(req, res, next) {
  if (isObjectIdOrHexString(req.params.id)) {
    return next();
  }

  return res.status(400).json({
    ok: false,
    error: {
      code: 'INVALID_ID',
      message: 'ID inválido',
    },
  });
}

module.exports = validateObjectId;