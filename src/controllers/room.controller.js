const { isObjectIdOrHexString } = require('mongoose');
const Room = require('../models/Room');
const User = require('../models/User');

exports.createRoom = async (req, res, next) => {
  try {
    const { name, description, isPrivate, ownerId } = req.body ?? {};

    if (!isObjectIdOrHexString(ownerId)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_ID', message: 'ownerId inválido' },
      });
    }

    const owner = await User.exists({ _id: ownerId });

    if (!owner) {
      return res.status(404).json({
        ok: false,
        error: { code: 'USER_NOT_FOUND', message: 'El dueño no existe' },
      });
    }

    const room = await Room.create({
      name,
      description,
      isPrivate,
      owner: owner._id,
      members: [owner._id],
    });

    return res.status(201).json({ ok: true, data: room });
  } catch (err) {
    return next(err);
  }
};    

exports.listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isPrivate: false }).lean();

    const data = rooms.map(({ members, ...room }) => ({
      ...room,
      memberCount: members.length,
    }));

    return res.json({ ok: true, data });
  } catch (err) {
    return next(err);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', 'username avatarUrl status');

    if (!room) {
      return res.status(404).json({
        ok: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Sala no encontrada' },
      });
    }

    return res.json({ ok: true, data: room });
  } catch (err) {
    return next(err);
  }
};

const validateObjectId = require('../middlewares/validateObjectId');

exports.joinRoom = async (req, res, next) => {
  try {
    const { userId } = req.body ?? {};
    const roomId = req.params.id;

    if (!isObjectIdOrHexString(userId)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_ID', message: 'userId inválido' },
      });
    }

    const user = await User.exists({ _id: userId });

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' },
      });
    }

    const room = await Room.findOneAndUpdate(
      { _id: roomId, members: { $ne: user._id } },
      { $addToSet: { members: user._id } },
      { returnDocument: 'after' }
    );

    if (room) {
      return res.json({ ok: true, data: room });
    }

    const roomExists = await Room.exists({ _id: roomId });

    if (!roomExists) {
      return res.status(404).json({
        ok: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Sala no encontrada' },
      });
    }

    return res.status(409).json({
      ok: false,
      error: { code: 'ALREADY_MEMBER', message: 'El usuario ya es miembro' },
    });
  } catch (err) {
    return next(err);
  }
};
