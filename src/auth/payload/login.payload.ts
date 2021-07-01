import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';

@ObjectType()
export class LoginPayload {
  @Field()
  user: User;

  @Field(() => String)
  accessToken: string;
}
