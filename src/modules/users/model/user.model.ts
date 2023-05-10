import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String, required: true },
    roles: { type: [String], required: true, default: 'member' },
    avatar: { type: String, default: 'https://picsum.photos/200/200' },
    is_deleted: { type: Boolean, required: true, default: false },
  },
  {
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    timestamps: true,
  },
);
