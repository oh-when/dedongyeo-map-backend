import { InputType, PartialType, OmitType, Field, GraphQLTimestamp, ID, PickType } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { Course } from '../entities/course.entity';

@InputType()
export class _CourseInput extends PartialType(Course, InputType) {}

@InputType()
export class CreateCourseInput {
  @Field(() => [ID], { description: 'list of sticker ids(순서 중요)' })
  stickers: [mongoose.Types.ObjectId];

  @Field(() => String!)
  title: string;

  @Field(() => Boolean!, {
    description: '코스 공유 여부',
    defaultValue: false,
  })
  isShare: boolean;

  @Field(() => [String], { description: '동행자 이름 리스트', nullable: true, defaultValue: [] })
  partners: string[];

  @Field(() => GraphQLTimestamp!, { description: '데이트 시작 timestamp' })
  startAt: Date;

  @Field(() => GraphQLTimestamp, {
    description: '데이트 종료 timestamp, 비워질 경우 Date.now으로 세팅됩니다.',
    nullable: true,
  })
  endAt?: Date;
}

@InputType()
export class UpdateCourseInput extends CreateCourseInput {
  @Field(() => ID, { description: 'Course id' })
  _id: mongoose.Types.ObjectId;
}

@InputType({
  description: `
    1. startAt없을 경우: [,endAt]
    2. endAt 없을 경우: [startAt,]
    3. (startAt, endAt)미포함: [,]
    4. (startAt, endAt) 포함: [startAt, endAt]`,
})
export class SearchCourseInput extends OmitType(_CourseInput, ['_id', 'stickers'] as const) {
  @Field(() => [ID], { description: 'Course id리스트', nullable: true })
  ids?: mongoose.Types.ObjectId[];
}
