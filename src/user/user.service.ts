import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<UserDocument>,
  ) {
  }

  // User Find - 회원가입 진행할 때 받는 입력값인 sns_id가 기존에 존재하는 user에 이미 존재하는지 판별
  async findBySnsId(sns_id: string): Promise<boolean> {
		try {
			/*
				await findOne() vs await findOne().exec() 참고자료
				- https://mongoosejs.com/docs/promises.html#should-you-use-exec-with-await? 
			*/
			const user: mongoose.Model<UserDocument> | null = await this.userModel.findOne({ sns_id }).exec();
			return user !== null;
		} catch (err) {
			console.log(err);
			// throw new InternalServerErrorException();
		}
	}

	// User Find - user_id로 단순 조회
	async findOneById(user_id: mongoose.Types.ObjectId): Promise<User> {
	}

  // User Create - 회원가입
  async create(): Promise<User> {
  }

	// User Update - 정보 수정
  async update(): Promise<User> {
  }

	// User Delete - 회원 탈퇴
  async delete(): Promise<void> {
  }
}
