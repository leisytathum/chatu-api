const { isObjectIdOrHexString } = require('mongoose');
const Message = require('../models/Message');
const Room = require('../models/Room');

exports.sendMessage = async (req, res, next) => {
  try {
    const { senderId, content } = req.body ?? {};

    if (!isObjectIdOrHexString(senderId)) {
      return res.status(400).json({
        ok: false,
        error: { code: 'INVALID_ID', message: 'senderId inválido' },
      });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        ok: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Sala no encontrada' },
      });
    }

    const isMember = room.members.some((memberId) => memberId.equals(senderId));

    if (!isMember) {
      return res.status(403).json({
        ok: false,
        error: {
          code: 'NOT_MEMBER',
          message: 'El usuario no pertenece a la sala',
        },
      });
    }

    if (typeof content !== 'string') {
      return res.status(400).json({
        ok: false,
        error: { code: 'VALIDATION', message: 'El contenido debe ser texto' },
      });
    }

    const message = await Message.create({
      room: room._id,
      sender: senderId,
      content,
    });

    await message.populate('sender', 'username avatarUrl');

    return res.status(201).json({ ok: true, data: message });
  } catch (err) {
    return next(err);
  }
};

exports.listMessages = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const offset = (page - 1) * limit;

    if (
      !Number.isSafeInteger(page) || page < 1 ||
      !Number.isSafeInteger(limit) || limit < 1 || limit > 100 ||
      !Number.isSafeInteger(offset)
    ) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'VALIDATION',
          message: 'page debe ser un entero positivo y limit debe estar entre 1 y 100',
        },
      });
    }

    const roomId = req.params.id;
    const roomExists = await Room.exists({ _id: roomId });

    if (!roomExists) {
      return res.status(404).json({
        ok: false,
        error: { code: 'ROOM_NOT_FOUND', message: 'Sala no encontrada' },
      });
    }

    const filter = { room: roomId };
    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(offset)
        .limit(limit)
        .populate('sender', 'username avatarUrl'),
      Message.countDocuments(filter),
    ]);

    return res.json({
      ok: true,
      data: messages,
      meta: { page, limit, total },
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateMessage = async (req, res, next) => {
  try {
    const { content } = req.body ?? {};

    if (typeof content !== 'string') {
      return res.status(400).json({
        ok: false,
        error: { code: 'VALIDATION', message: 'El contenido debe ser texto' },
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $set: { content, edited: true } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        ok: false,
        error: { code: 'MESSAGE_NOT_FOUND', message: 'Mensaje no encontrado' },
      });
    }

    return res.json({ ok: true, data: message });
  } catch (err) {
    return next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        ok: false,
        error: { code: 'MESSAGE_NOT_FOUND', message: 'Mensaje no encontrado' },
      });
    }

    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};