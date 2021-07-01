import { Field, Int, ObjectType } from '@nestjs/graphql';
import { IsIn } from 'class-validator';

@ObjectType({
  description: '스티커 번호(sticker_index)기반으로 그룹화된 스티커 Count 정보',
})
export class GroupedSticker {
  @Field(() => Int, { description: '스티커 번호, 0~11' })
  sticker_index: number;

  @Field(() => Int, { description: '그룹에 포함된 스티커 총 갯수' })
  total_count: number;
}

@ObjectType({
  description: '스티커 번호(sticker_index)와 스티커 당도(sweet_percent)기반으로 그룹화된 스티커 Count 정보',
})
export class GroupedDetailSticker extends GroupedSticker {
  @Field(() => Int, { description: '스티커 당도 퍼센트' })
  @IsIn([0, 30, 50, 70, 100])
  sweet_percent: number;
}
