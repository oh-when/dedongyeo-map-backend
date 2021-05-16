import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@ObjectType({
  description: '',
})
@Schema({ timestamps: true })
export class User {
  @Field(() => String, { description: 'user id' })
  _id: mongoose.Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true, unique: true })
  email: string;

  @Field(() => String)
  @Prop({ select: false })
  password: string;

  @Field(() => String)
  @Prop({ required: true })
  nickName: string;

  @Field(() => String)
  @Prop({ required: true })
  phone: string;

  @Field(() => Boolean, { description: '소셜 회원가입 여부' })
  @Prop({ default: false })
  isSocial: boolean;

  @Field(() => String, { description: '회원 탈퇴여부' })
  @Prop({
    type: String,
    default: 'ACT',
    enum: ['ACT', 'DELETE'],
  })
  status: string;

  @Field(() => Date)
  @Prop({ type: Date, default: new Date() })
  createdAt: Date;
}

export type UserDocument = User & mongoose.Document;
export const UserSchema = SchemaFactory.createForClass(User);
