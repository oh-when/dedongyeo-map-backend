import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsPhoneNumber, IsString, MaxLength, MinLength } from 'class-validator';

@InputType()
export class createUserInput {
  @Field(() => String)
  @IsString()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @Field(() => String)
  @IsString()
  @MaxLength(12)
  nickName: string;

  @Field(() => String)
  @IsString()
  @MaxLength(11)
  // @IsPhoneNumber('KR', { message: '핸드폰 번호 형식이 아닙니다.' })
  phone: string;
}
