import { InputType, PartialType, OmitType } from '@nestjs/graphql';
import { Course } from '../entities/course.entity';

@InputType()
export class CourseInput extends PartialType(Course, InputType) {}

@InputType()
export class CreateCourseInput extends OmitType(CourseInput, ['_id'] as const) {}

@InputType()
export class SearchCourseInput extends CourseInput {}
