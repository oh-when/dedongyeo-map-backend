import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { createUserInput } from './dto/create-user.input';
import { createSnsUserInput } from './dto/create-sns-user.input';
import { loginInput } from './dto/login.input';
import { LoginPayload } from '../auth/payload/login.payload';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Resolver(typeOf => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(returns => LoginPayload)
  async login(@Args('loginInput') loginInput: loginInput) {
    return this.userService.login(loginInput);
  }

  @UseGuards(JwtGuard)
  @Query(returns => [User])
  async users() {
    return await this.userService.findAll();
  }

  @Mutation(returns => User)
  async createUser(@Args('createUserInput') createUserInput: createUserInput) {
    return await this.userService.create(createUserInput);
  }

  @Mutation(returns => User)
  async createSNSUser(@Args('createSNSUserInput') createSNSUserInput: createSnsUserInput) {
    return await this.userService.create(createSNSUserInput);
  }
}
