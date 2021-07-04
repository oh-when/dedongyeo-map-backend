import * as mongoose from 'mongoose';
import { Resolver, Query, Mutation, Args, ResolveField, Parent, Int, ID } from '@nestjs/graphql';

import { CourseService } from './course.service';
import { Course, CourseDocument } from './entities/course.entity';

import { Sticker } from '../sticker/entities/sticker.entity';
import { CreateCourseInput, SearchCourseInput, UpdateCourseInput } from './dto/course.input';
import { DeleteQueryDto } from 'src/shared/deleteQuery.dto';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course, {
    description: 'Sticker를 사용하여 코스를 생성합니다. 이때 코스의 순서는 전달된 스티커들의 순서로 처리됩니다.',
  })
  async createCourse(@Args('createCourseInput') createCourseInput: CreateCourseInput): Promise<Course> {
    return await this.courseService.create(createCourseInput);
  }

  @Mutation(() => Course)
  async updateCourse(@Args('updateCourseInput') updateCourseInput: UpdateCourseInput) {
    return await this.courseService.update(updateCourseInput);
  }

  @Query(() => [Course], { name: 'courses', description: 'get Courses' })
  async findAll(
    @Args({ name: 'searchCourseInput', nullable: true }) searchCourseInput: SearchCourseInput,
  ): Promise<Course[]> {
    const inputKeys: string[] = Object.keys(searchCourseInput);
    if (!inputKeys || inputKeys.length === 0) {
      return await this.courseService.findAll();
    }
    return await this.courseService.findCourses(searchCourseInput);
  }

  @Query(() => Course, {
    name: 'course',
    description: 'a Course',
  })
  async findOne(@Args('courseId', { type: () => ID }) courseId: mongoose.Types.ObjectId): Promise<Course> {
    return await this.courseService.findOne(courseId);
  }

  @ResolveField(() => [Sticker], {
    description:
      'populate: true 경우 sticker값을 치환하여 반환합니다. populate을 설정하지 않는다면 _id를 반환받을 수 있습니다.',
  })
  async stickers(
    @Parent() course: CourseDocument,
    @Args({ name: 'populate', nullable: true, defaultValue: false })
    populate: boolean,
  ) {
    if (populate) {
      return await this.courseService.populateStickers(course._id);
    }
    return course.stickers;
  }

  @Mutation(() => DeleteQueryDto, {
    name: 'removeCourse',
    description: '코스를 삭제합니다.',
  })
  async removeCourse(@Args('id', { type: () => ID }) id: mongoose.Types.ObjectId) {
    return this.courseService.remove(id);
  }
}
