import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ObjectType({
  description: '페이지네이션 정보',
})
export class PageInfo {
  @Field(() => Int, { description: '검색된 문서 수' })
  total_count: number;

  @Field(() => Boolean, {
    description: '현재 페이지가 마지막 페이지인지 여부, 값이 false면 page를 증가시켜 다음 페이지를 요청할 수 있음',
  })
  is_end: boolean;

  @Field(() => Int, {
    description:
      '페이지 수(카카오 api가 최대 45개의 문서만 검색 가능하기 때문에 total_count와 매칭되지 않을 수 있다. https://devtalk.kakao.com/t/pageable-count/88418)',
  })
  total_page_count?: number;

  @Field(() => Int, { description: '현재 페이지 번호' })
  cur_page: number;
}

@InputType({
  description: '검색 페이지네이션 dto',
})
export class PageSearchDto {
  @Field(() => Int, {
    description: '결과 페이지 번호',
    nullable: true,
    defaultValue: 1,
  })
  @Min(1)
  page?: number;

  @Field(() => Int, {
    description: '한 페이지에 보여질 문서의 개수, 1~15 사이의 값',
    nullable: true,
    defaultValue: 15,
  })
  @Min(1)
  @Max(15)
  size?: number;
}
