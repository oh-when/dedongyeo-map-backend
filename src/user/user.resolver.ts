import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { createUserInput } from './dto/create-user.input';

@Resolver(or => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  async users() {
    return await this.userService.findAll();
  }

  @Mutation(returns => User)
  async createUser(@Args('createUserInput') createUserInput: createUserInput) {
    return await this.userService.create(createUserInput);
  }
}
