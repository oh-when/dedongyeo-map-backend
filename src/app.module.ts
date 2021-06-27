import { Module } from '@nestjs/common';
import * as path from 'path';

import { AppService } from './app.service';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { PlaceModule } from './place/place.module';
import { SpotModule } from './spot/spot.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { StickerModule } from './sticker/sticker.module';
import { SharedModule } from './shared/shared.module';
import { AppResolver } from './app.resolver';
import { ExceptionsLoggerFilter } from './shared/exceptionsLogger.filter';

@Module({
  imports: [
    AppConfigModule,
    GraphQLModule.forRoot({
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      debug: false,
      playground: true,
      introspection: true,
      sortSchema: true,
      context: ({ req }) => ({ req }),
      formatError: (error: GraphQLError) => {
        if (error.message === 'VALIDATION_ERROR') {
          const extensions = {
            code: 'VALIDATION_ERROR',
            errors: [],
          };

          Object.keys(error.extensions.invalidArgs).forEach(key => {
            const constraints = [];
            Object.keys(error.extensions.invalidArgs[key].constraints).forEach(_key => {
              constraints.push(error.extensions.invalidArgs[key].constraints[_key]);
            });

            extensions.errors.push({
              field: error.extensions.invalidArgs[key].property,
              errors: constraints,
            });
          });

          const graphQLFormattedError: GraphQLFormattedError = {
            message: 'VALIDATION_ERROR',
            extensions: extensions,
          };

          return graphQLFormattedError;
        } else {
          return error;
        }
      },
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],

      useFactory: async (cfs: AppConfigService) => {
        return {
          uri: await cfs.getDB(),
          useNewUrlParser: true,
          // useFindAndModify: false,
        };
      },
      inject: [AppConfigService],
    }),
    PlaceModule,
    SpotModule,
    StickerModule,
    CourseModule,
    UserModule,
    SharedModule,
  ],
  providers: [AppService, AppResolver, { provide: APP_FILTER, useClass: ExceptionsLoggerFilter }],
})
export class AppModule {}
