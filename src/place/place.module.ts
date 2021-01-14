import { Module, CacheModule } from "@nestjs/common";
import * as cacheManager from "cache-manager";
import * as mongoStore from "cache-manager-mongodb";

import { ConfigModule } from "../config/config.module";
import { SearchService } from "./kakaoMapSearch/search.service";
import { PlaceResolver } from "./place.resolver";

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      store: mongoStore,
      uri: "mongodb://0.0.0.0:27017/nodeCacheDb",
      options: {
        collection: "cacheManager",
        compression: false,
        poolSize: 5,
      },
      ttl: 300,
    }),
  ],
  providers: [SearchService, PlaceResolver],
})
export class PlaceModule {}
