import { InputType, Int, Float, Field } from '@nestjs/graphql';
import { PageSearchDto } from 'src/shared/entities/pageinfo.entity';

@InputType({
  description: '키워드 기반으로 spot을 검색합니다. ',
})
export class SearchSpotDto extends PageSearchDto {
  @Field(() => String, { description: '비워질 경우 필터링 없이 검색됩니다.', nullable: true })
  keyword?: string;
}

@InputType({
  description: '주어진 x,y 기준으로 근처 spot을 검색합니다.',
})
export class SearchNearSpotDto extends PageSearchDto {
  @Field(() => String, { description: '비워질 경우 x,y 기준으로만 검색됩니다.', nullable: true })
  keyword?: string;

  @Field(() => Float, { nullable: true })
  x: number;

  @Field(() => Float, { nullable: true })
  y: number;

  @Field(() => Int, {
    description:
      '단위 meter, 0~20000 사이의 값으로 중심 좌표부터의 반경거리. 특정 지역을 중심으로 검색하려고 할 경우 중심좌표로 쓰일 x,y와 함께 사용.',
    nullable: true,
    defaultValue: 1000,
  })
  radius?: number;
}
