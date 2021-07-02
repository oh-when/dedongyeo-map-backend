import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CourseInput {
  @Field(() => String, {
    description: '코스 id',
  })
  courseId: String;
}
