import Axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSpotInput } from '../../spot/dto/create-spot.input';
import { KeywordSearchDto } from './search.dto';
import { PaginatedPlace, Place } from '../place.entity';
import { PageInfo } from '../../shared/entities/pageinfo.entity';
import { PageService } from '../../shared/page.service';
import { SortType } from '../../place/kakaoMapSearch/search.dto';
import { KakaoApiServerError, PlaceNotFoundException, PlaceNotFoundIdenticalException } from 'src/shared/exceptions';

@Injectable()
export class SearchService {
  constructor(private configService: ConfigService, private pageService: PageService) {}

  // https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
  async searchByKeyword(keywordSearchDto: KeywordSearchDto): Promise<PaginatedPlace> {
    const baseUrl = this.configService.get('app.KAKAO_DEV_HOST');

    const responseData = await Axios.get(baseUrl, {
      headers: {
        Authorization: `KakaoAK ${this.configService.get('app.KAKAO_DEV_REST_API_KEY')}`,
      },
      params: {
        ...keywordSearchDto,
      },
    })
      .then(response => response.data)
      .catch(err => {
        if (err?.response?.status == 400) {
          throw new PlaceNotFoundException(keywordSearchDto);
        }
        throw new KakaoApiServerError();
      });

    const { total_count, is_end } = responseData.meta;
    const { size, page } = keywordSearchDto;
    const pageInfo: PageInfo = this.pageService.getPageInfoForKakao(size, page, total_count, is_end);

    const paginatedPlace: PaginatedPlace = {
      ...pageInfo,
      places: responseData.documents,
    };

    return paginatedPlace;
  }

  async getIdenticalPlace(createSpotInput: CreateSpotInput): Promise<Place | null> {
    return await this.searchByKeyword({
      query: createSpotInput.place_name,
      x: createSpotInput.x,
      y: createSpotInput.y,
      radius: 100,
      sort: SortType.distance,
    })
      .then(({ places }) => places[0])
      .catch(error => {
        console.log(error);
        throw new PlaceNotFoundIdenticalException(createSpotInput.place_name);
      });
  }
}
