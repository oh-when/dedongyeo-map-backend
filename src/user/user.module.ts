import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import * as bcrypt from 'bcrypt';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;

          schema.pre<UserDocument>('save', async function (next: Function) {
            const user = this;
            if (user?.password) {
              user.password = await bcrypt.hash(user.password, 10);
            }
            next();
          });
          return schema;
        },
      },
    ]),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
