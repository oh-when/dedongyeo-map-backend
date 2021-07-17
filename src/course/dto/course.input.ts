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
}

@InputType()
export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @Field(() => ID!, { description: 'Course id' })
  _id!: mongoose.Types.ObjectId;

  @Field(() => GraphQLTimestamp, { description: '데이트 시작 timestamp', nullable: true })
  startAt?: Date;

  @Field(() => GraphQLTimestamp, {
    description: '데이트 종료 timestamp',
    nullable: true,
  })
  endAt?: Date;

  @Field(() => [String], { description: '동행자 이름 리스트', nullable: true })
  partners?: string[];
}

@InputType({
  description: `
    1. startAt없을 경우: [,endAt]
    2. endAt 없을 경우: [startAt,]
    3. (startAt, endAt)미포함: [,]
    4. (startAt, endAt) 포함: [startAt, endAt]`,
})
export class SearchCourseInput extends OmitType(_CourseInput, ['_id', 'stickers', 'isShare'] as const) {
  @Field(() => [ID], { description: 'Course id리스트', nullable: true })
  ids?: mongoose.Types.ObjectId[];

  @Field(() => Boolean, {
    description: '코스 공유 여부',
    nullable: true,
  })
  isShare?: boolean;
}
