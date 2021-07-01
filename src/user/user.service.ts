import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { createUserInput } from './dto/create-user.input';
import { createSnsUserInput } from './dto/create-sns-user.input';
import { loginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginPayload } from '../auth/payload/login.payload';
import { JwtPayload } from '../auth/payload/jwt.payload';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password: pass }: loginInput): Promise<LoginPayload> {
    const user = await this.findByEmail(email);
    if (!user) throw new BadRequestException('이메일이 일치하지 않습니다.');

    const isPasswordCorrect = await bcrypt.compare(pass, user.password);
    if (!isPasswordCorrect) throw new BadRequestException('비밀번호가 일치하지 않습니다.');

    const payload: JwtPayload = { _id: user._id, email: user.email };

    return { user, accessToken: this.jwtService.sign(payload) };
  }

  findAll() {
    return this.userModel.find().exec();
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(user: createUserInput | createSnsUserInput): Promise<User> {
    const isAlreadyJoined = await this.findByEmail(user.email);
    if (isAlreadyJoined) {
      throw new BadRequestException('이미 가입된 이메일 주소입니다.');
    }

    const createUser = new this.userModel(user);
    return createUser.save();
  }
}
