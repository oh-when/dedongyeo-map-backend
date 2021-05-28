import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { createUserInput } from './dto/create-user.input';
import { createSnsUserInput } from './dto/create-sns-user.input';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findAll() {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(user: createUserInput | createSnsUserInput): Promise<User> {
    const isAlreadyJoined = await this.findByEmail(user.email);
    if (isAlreadyJoined) {
      throw new NotAcceptableException('이미 가입된 이메일 주소입니다.');
    }

    const createUser = new this.userModel(user);
    return createUser.save();
  }
}
