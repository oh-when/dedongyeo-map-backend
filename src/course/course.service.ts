import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Course, CourseDocument } from '../course/entities/course.entity';
import { CreateCourseInput } from '../course/dto/create-course.input';
import { StickerService } from '../sticker/sticker.service';
import { Sticker } from '../sticker/entities/sticker.entity';
import { CourseNotFoundException } from 'src/shared/exceptions';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: mongoose.Model<CourseDocument>,
    private readonly stickerService: StickerService,
  ) {}

  async create(createCourseInput: CreateCourseInput): Promise<Course> {
    createCourseInput.stickers.forEach(sticker => {
      this.stickerService.update({ _id: sticker, is_used: true });
    });
    const createdCourse = new this.courseModel(createCourseInput);
    return createdCourse.save();
  }
  async findOne(courseId: mongoose.Types.ObjectId): Promise<Course> {
    return this.courseModel
      .findById(courseId)
      .exec()
      .catch(err => {
        throw new CourseNotFoundException(courseId);
      });
  }

  async findAll(): Promise<Course[]> {
    return this.courseModel.find().exec();
  }

  async populateStickers(courseId: mongoose.Types.ObjectId): Promise<Sticker[]> {
    return this.courseModel
      .aggregate([
        {
          $match: { _id: courseId },
        },
        {
          $lookup: {
            from: 'stickers',
            localField: 'stickers',
            foreignField: '_id',
            as: 'stickers',
          },
        },
      ])
      .then(response => response[0].stickers);
  }
}
