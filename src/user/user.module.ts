import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from './entities/user.entity';
import { UserResolver } from './user.resolver';
import * as bcrypt from 'bcrypt';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { AppConfigService } from 'src/config/config.service';
import { AppConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: (cfg: AppConfigService) => {
        return {
          secret: cfg.get('JWT_SECRET_KEY'),
        };
      },
      inject: [AppConfigService],
    }),
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
  providers: [UserService, UserResolver, JwtStrategy],
  exports: [UserService],
})
export class UserModule {}
