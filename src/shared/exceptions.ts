import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { KeywordSearchDto } from '../place/kakaoMapSearch/search.dto';

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
