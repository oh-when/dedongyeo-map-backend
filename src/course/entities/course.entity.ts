import { ObjectType, Field, GraphQLTimestamp, ID } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Sticker } from '../../sticker/entities/sticker.entity';
import { PageInfo } from 'src/shared/entities/pageinfo.entity';

@ObjectType({
  description: '스티커(스팟)을 순서대로 저장하고 있는 데이터 코스 정보',
})
@Schema({ timestamps: true })
export class Course {
  @Field(() => ID, { description: 'Course id' })
  @Prop()
  _id: mongoose.Types.ObjectId;

  @Field(() => [ID], { description: 'list of sticker ids(순서 중요)' })
  @Prop({ type: [mongoose.Types.ObjectId], ref: 'Sticker' })
  stickers: [mongoose.Types.ObjectId];

  @Field(() => String!)
  @Prop()
  title: string;

  @Field(() => Boolean!, {
    description: '코스 공유 여부',
    nullable: true,
    defaultValue: false,
  })
  @Prop({ default: false })
  isShare: boolean;

  @Field(() => [String], { description: '동행자 이름 리스트', nullable: true, defaultValue: [] })
  @Prop({ default: [] })
  partners: string[];

  @Field(() => GraphQLTimestamp!, { description: '데이트 시작 timestamp' })
  @Prop()
  startAt: Date;

  @Field(() => GraphQLTimestamp, {
    description: '데이트 종료 timestamp, 비워질 경우 Date.now으로 세팅됩니다.',
    nullable: true,
  })
  @Prop({ default: Date.now() })
  endAt: Date;

  // @Field(() => String, {
  //   description: "스티커를 생성한 User",
  // })
  // @Prop({ type: mongoose.Types.ObjectId, ref: "User" })
  // owner: mongoose.Types.ObjectId;
}

@ObjectType({
  description: '페이지네이션 정보를 포함한 Course 정보',
})
export class PaginatedCourse extends PageInfo {
  @Field(() => [Course], { description: 'Course 정보들' })
  courses: Course[];
}

export type CourseDocument = Course & mongoose.Document;
export const CourseSchema = SchemaFactory.createForClass(Course);
