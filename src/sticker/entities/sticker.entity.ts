import { ObjectType, Field, registerEnumType, IntersectionType, Int, GraphQLTimestamp } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Spot } from '../../spot/entities/spot.entity';
import { IsIn, IsInt, Max, Min } from 'class-validator';

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

  @Field(() => Int, {
    description: '스티커 번호, 0~11',
  })
  @Prop({ required: true })
  @Min(0, {
    message: 'index는 0부터 시작합니다.',
  })
  @Max(11, {
    message: 'index는 11이 max입니다.',
  })
  @IsInt()
  sticker_index: number;

  @Field(() => Int, {
    description: '스티커 당도 퍼센트',
  })
  @Prop({ required: true })
  @IsIn([0, 30, 50, 70, 100])
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

  @Field(() => [String], { description: '동행자 이름 리스트', nullable: true, defaultValue: [] })
  @Prop({ default: [] })
  partners: string[];

  @Field(() => GraphQLTimestamp!, { description: '시작 timestamp' })
  @Prop()
  startAt: number;

  @Field(() => GraphQLTimestamp, {
    description: '종료 timestamp, 비워질 경우 Date.now으로 세팅됩니다.',
  })
  @Prop({ default: Date.now() })
  endAt: number;
}

export type StickerDocument = Sticker & mongoose.Document;
export const StickerSchema = SchemaFactory.createForClass(Sticker);
