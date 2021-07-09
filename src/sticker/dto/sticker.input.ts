import { InputType, Field, IntersectionType, OmitType, GraphQLTimestamp } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { CreateSpotInput } from '../../spot/dto/create-spot.input';
import { Sticker } from '../entities/sticker.entity';

@InputType()
export class StickerInput extends OmitType(Sticker, ['_id', 'spot'] as const) {}

@InputType()
export class CreateStickerInput extends IntersectionType(CreateSpotInput, StickerInput) {}

@InputType()
export class UpdateStickerInput {
  @Field(() => String, { description: 'Sticker id' })
  _id: mongoose.Types.ObjectId;

  @Field(() => Boolean, {
    description: 'Sticker가 코스 생성에 사용여부',
    nullable: true,
  })
  is_used: boolean;
}

@InputType({
  description: `
    1. startAt없을 경우: [,endAt]
    2. endAt 없을 경우: [startAt,]
    3. (startAt, endAt)미포함: [,]
    4. (startAt, endAt) 포함: [startAt, endAt]`,
})
export class SearchStickerInput {
  @Field(() => Boolean, { description: 'Sticker가 코스 생성에 사용여부', defaultValue: false })
  is_used?: boolean;

  @Field(() => GraphQLTimestamp!, { description: '시작 timestamp, 비워질 경우 endAt만 검증합니다.', nullable: true })
  startAt?: Date;

  @Field(() => GraphQLTimestamp, {
    description: '종료 timestamp, 비워질 경우 Date.now()로 세팅됩니다.',
    nullable: true,
  })
  endAt?: Date;
}
