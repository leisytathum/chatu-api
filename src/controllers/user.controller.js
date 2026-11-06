const User = require('../models/User');

exports.createUser = async (req, res, next) => {
  try {
    const { username, email, avatarUrl, status } = req.body ?? {};
    const user = await User.create({ username, email, avatarUrl, status });

    return res.status(201).json({ ok: true, data: user });
  } catch (err) {
    return next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status !== undefined) {
      if (!['online', 'offline', 'away'].includes(status)) {
        return res.status(400).json({
          ok: false,
          error: { code: 'VALIDATION', message: 'Estado inválido' },
        });
      }

      filter.status = status;
    }

    const users = await User.find(filter);
    return res.json({ ok: true, data: users });
  } catch (err) {
    return next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' },
      });
    }

    return res.json({ ok: true, data: user });
  } catch (err) {
    return next(err);
  }
};