import { ObjectType, Field, registerEnumType, IntersectionType } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Spot } from '../../spot/entities/spot.entity';

@ObjectType({
  description: "'이모지 스티커'로 코스 생성에 기본적으로 사용되는 단위입니다.",
})
@Schema({ timestamps: true })
export class Sticker {
  @Field(() => String, { description: 'Sticker id' })
  _id?: mongoose.Types.ObjectId;
  // @Field(() => String, {
  //   description: "스티커를 생성한 User",
  // })
  // @Prop({ type: mongoose.Types.ObjectId, ref: "User" })
  // owner: mongoose.Types.ObjectId;

  // @Field(() => [String], {
  //   description: "스티커를 생성한 User와 함께한 파트너들(User 리스트)",
  // })
  // @Prop({ type: [mongoose.Types.ObjectId], ref: "User" })
  // partners: mongoose.Types.ObjectId[];

  @Field(() => Number, {
    description: '스티커 번호, 0~11',
  })
  @Prop({ required: true })
  sticker_index: number;

  @Field(() => Number, {
    description: '스티커 당도 퍼센트',
  })
  @Prop({ required: true })
  sweet_percent: number;

  @Field(() => Boolean, { description: 'Sticker가 코스 생성에 사용여부' })
  @Prop({ default: false })
  is_used?: boolean;

  @Field(() => Spot, {
    description: '스티커가 붙여진 Spot id 또는 Spot 객체값',
    nullable: true,
  })
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Spot' })
  spot?: mongoose.Types.ObjectId | Spot;
}

@ObjectType({
  description: '그룹 스티커 id 타입',
})
export class GroupStickerId {
  @Field(() => Number, {
    description: '스티커 번호, 0~11',
  })
  sticker_index?: number;
}

@ObjectType({
  description: '스팟으로부터 스티커 정보를 받아올 때 사용하는 스티커 타입',
})
export class GroupedSticker {
  @Field(() => GroupStickerId, { description: '그룹에 사용된 스티커 index' })
  _id: GroupStickerId;

  @Field(() => Number, { description: '그룹에 포함된 스티커 총 갯수' })
  total_count?: number;
}

@ObjectType()
export class PopulateStickerResult extends IntersectionType(GroupedSticker, Sticker) {}

export type StickerDocument = Sticker & mongoose.Document;
export const StickerSchema = SchemaFactory.createForClass(Sticker);
