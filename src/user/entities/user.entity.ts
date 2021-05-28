import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field(() => String, { description: 'user id' })
  _id: mongoose.Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true, unique: true })
  email: string;

  @Field(() => String)
  @Prop()
  password?: string;

  @Field(() => String)
  @Prop({ required: true })
  nickName: string;

  @Field(() => String)
  @Prop({ required: true })
  phone: string;

  @Field(() => String, { description: '소셜 로그인시 받는 ID값' })
  @Prop({ required: false })
  socialUid?: string;

  @Field(() => String, { description: '회원 탈퇴여부' })
  @Prop({
    type: String,
    default: 'ACT',
    enum: ['ACT', 'DELETE'],
  })
  status: string;

  @Field(() => Boolean, { description: '마케팅 활용 동의여부' })
  @Prop({
    type: Boolean,
    default: true,
  })
  isAcceptTerms: boolean;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;
}

export type UserDocument = User & mongoose.Document;
export const UserSchema = SchemaFactory.createForClass(User);
