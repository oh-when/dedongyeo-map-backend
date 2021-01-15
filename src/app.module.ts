import { Module } from "@nestjs/common";
import { join } from "path";
import { GraphQLModule } from "@nestjs/graphql";
import { MongooseModule } from "@nestjs/mongoose";

import { ConfigService } from "src/config/config.service";
import { ConfigModule } from "./config/config.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EmojiModule } from "./emoji/emoji.module";
import { CommentModule } from "./comment/comment.module";
import { SpotModule } from "./spot/spot.module";
import { PlaceModule } from "./place/place.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule,
    EmojiModule,
    CommentModule,
    SpotModule,
    PlaceModule,
    UserModule,
    SpotModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      debug: false,
      playground: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cfs: ConfigService) => ({
        uri: cfs.getDB(),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
