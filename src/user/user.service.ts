import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { createUserInput } from './dto/create-user.input';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findAll() {
    return this.userModel.find().exec();
  }

  create(user: createUserInput): Promise<User> {
    // email validation
    const createUser = new this.userModel(user);
    return createUser.save();
  }
}
