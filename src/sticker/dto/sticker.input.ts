import { InputType, Field, IntersectionType, Int, PartialType, OmitType } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { Min, Max, IsInt, IsIn } from 'class-validator';
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
