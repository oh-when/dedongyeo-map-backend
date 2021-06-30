import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: '스팟으로부터 스티커 정보를 받아올 때 사용하는 스티커 타입',
})
export class GroupedSticker {
  @Field(() => Int, { description: '스티커 번호, 0~11' })
  _id?: number;
  // sticker_index

  @Field(() => Int, { description: '그룹에 포함된 스티커 총 갯수' })
  total_count?: number;
}
