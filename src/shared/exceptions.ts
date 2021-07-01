import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { KeywordSearchDto } from '../place/kakaoMapSearch/search.dto';

export class PlaceNotFoundException extends BadRequestException {
  constructor(keywordSearchDto: KeywordSearchDto) {
    super(`Kakao Place Not Found.\r\n SearchDto Info: ${keywordSearchDto}`);
  }
}

export class PlaceNotFoundIdenticalException extends BadRequestException {
  /* Identical한 Place를 찾지 못할 때 발생.
   * 카카오 API에는 Retrieve가 구현되어있지 않고 있다.
   * 이 때문에 클라이언트에 제공했던 place에 사용자가 최초로 스티커를 붙일 경우, 다시 place를 검색해주어야 한다.
   * 이때 place명과 coordinate를 조합해 쿼리하는데 API로 데이터를 찾지 못할 경우 해당 에러를 보내준다.
   */
  constructor(placeName: string) {
    super(`There is no identical Kakao Place(${placeName})`);
  }
}

export class CourseNotFoundException extends BadRequestException {
  constructor(courseId: String) {
    super(`Course(id: ${courseId}) Not Found`);
  }
}

export class MapBoxNoRoutesException extends BadRequestException {
  constructor(routes: Object) {
    super(`There is no "Course-Routes" which is given by Mapbox.\r\n Routes info: ${routes}`);
  }
}

export class StickerNotFoundException extends BadRequestException {
  constructor(stickerId: mongoose.Types.ObjectId) {
    super(`Sticker(id: ${stickerId}) Not Found`);
  }
}

export class SpotNotFoundException extends BadRequestException {
  constructor(placeName: RegExp) {
    super(`Spot(place name: ${placeName}) Not Found`);
  }
}

export class CustomSpotNotFoundException extends BadRequestException {
  constructor(spotId: mongoose.Types.ObjectId) {
    super(`CustomSpot(id: ${spotId}) Not Found`);
  }
}

export class CustomSpotValidationException extends BadRequestException {
  constructor() {
    super(`커스텀 스팟의 "is_custom" field true로 설정되어야 합니다.`);
  }
}

export class CustomSpotUpdateWhenPublicException extends BadRequestException {
  constructor() {
    super(`공개 설정이된 커스텀 스팟은 수정 되어서는 안됩니다.`);
  }
}

export class KakaoApiServerError extends InternalServerErrorException {
  constructor() {
    super(`Kakao API server error`);
  }
}

export class SpotNoNearException extends InternalServerErrorException {
  constructor(coordinates: number[]) {
    super(`There are no near spots from ${coordinates}`);
  }
}

export class SpotDoesNotExistException extends InternalServerErrorException {
  constructor() {
    super(`Spot Deos Not Exist for that query`);
  }
}

export class StickerDoesNotExistException extends InternalServerErrorException {
  constructor() {
    super(`Sticker Deos Not Exist for that query`);
  }
}
