import * as mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  roles?: [string];
  phone?: string;
  avatar?: string;
  is_deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
