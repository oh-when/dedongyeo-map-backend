import mongoose from 'mongoose';

export interface JwtPayload {
  _id: mongoose.Types.ObjectId;
  email: string;
}
