const { Schema, model } = require('mongoose');

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la sala es obligatorio'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El dueño de la sala es obligatorio'],
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = model('Room', roomSchema);