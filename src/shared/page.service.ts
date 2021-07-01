import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PageInfo } from './entities/pageinfo.entity';

@Injectable()
export class PageService {
  readonly MAX_KAKAO_PAGEABLE_COUNT = 45;
  constructor(private configService: ConfigService) {}

  getPageInfo(size: number, cur_page: number, total_count: number, is_end: boolean): PageInfo {
    return {
      total_count,
      total_page_count: Math.ceil(total_count / size),
      is_end,
      cur_page,
    };
  }

  getPageInfoForKakao(size: number, cur_page: number, count: number, is_end: boolean): PageInfo {
    const total_count: number = Math.min(this.MAX_KAKAO_PAGEABLE_COUNT, count);
    return {
      total_count,
      total_page_count: Math.ceil(total_count / size),
      is_end,
      cur_page,
    };
  }
}
