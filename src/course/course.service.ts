import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Course, CourseDocument } from '../course/entities/course.entity';
import { StickerService } from '../sticker/sticker.service';
import { Sticker } from '../sticker/entities/sticker.entity';
import { CourseNotFoundException } from 'src/shared/exceptions';
import { CreateCourseInput, UpdateCourseInput } from './dto/course.input';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: mongoose.Model<CourseDocument>,
    private readonly stickerService: StickerService,
  ) {}

  async create(createCourseInput: CreateCourseInput): Promise<Course> {
    await this.stickerService.consumeStickers(createCourseInput.stickers);
    return await this.courseModel.create(createCourseInput);
  }

  async update(updateCourseInput: UpdateCourseInput): Promise<Course> {
    const courseID = updateCourseInput._id;
    return this.courseModel
      .findOneAndUpdate({ _id: courseID }, { $set: updateCourseInput }, { new: true })
      .exec()
      .catch(err => {
        throw new CourseNotFoundException(courseID);
      });
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
