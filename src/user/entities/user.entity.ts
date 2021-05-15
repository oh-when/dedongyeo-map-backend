import { ObjectType, Field, registerEnumType } from "@nestjs/graphql";
import * as mongoose from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@ObjectType({
  description: "사용자에 해당하는 단위",
})
@Schema({ timestamps: true })
export class User {
  @Field(() => String, { description: "User id" })
  _id: mongoose.Types.ObjectId;

  @Field(() => String, {
    description: "sns로그인으로 넘어오는 고유 아이디값",
  })
  @Prop({ required: true })
  sns_id: string;

  @Field(() => String, {
    description: "sns로그인으로 넘어오는 이메일",
  })
  @Prop({ required: true })
  email: string;

  @Field(() => Boolean, { 
		description: "개인정보 수집 처리 동의 여부" 
	})
  @Prop({ required: true })
  user_history: boolean;
}

export type UserDocument = User & mongoose.Document;
export const UserSchema = SchemaFactory.createForClass(User);
