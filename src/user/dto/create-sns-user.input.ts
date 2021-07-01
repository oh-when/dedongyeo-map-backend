import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class createSnsUserInput {
  @Field(() => String)
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @MaxLength(12)
  nickName: string;

  @Field(() => String)
  @IsString()
  @MaxLength(11)
  phone: string;

  @Field(() => String)
  @IsString()
  socialUid: string;
}
