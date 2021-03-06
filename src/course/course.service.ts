import * as mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Course, CourseDocument } from '../course/entities/course.entity';
import { StickerService } from '../sticker/sticker.service';
import { Sticker, StickerDocument } from '../sticker/entities/sticker.entity';
import { CourseNotFoundException } from 'src/shared/exceptions';
import { CreateCourseInput, SearchCourseInput, UpdateCourseInput } from './dto/course.input';
import { DeleteQueryDto } from 'src/shared/deleteQuery.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: mongoose.Model<CourseDocument>,
    private readonly stickerService: StickerService,
  ) {}

  async create(createCourseInput: CreateCourseInput): Promise<Course> {
    const stickers: StickerDocument[] = await this.stickerService.findAll(createCourseInput.stickers);
    await this.stickerService.consumeStickers(stickers);

    const newCreateCourseInput = {
      startAt: this.stickerService.getMinStartAt(stickers),
      endAt: this.stickerService.getMaxEndAt(stickers),
      partners: this.stickerService.gatherPartners(stickers),
      ...createCourseInput,
    };
    return await this.courseModel.create(newCreateCourseInput);
  }

  async update(updateCourseInput: UpdateCourseInput): Promise<Course> {
    // TODO: 권한 검증
    const courseID = updateCourseInput._id;
    return this.courseModel
      .findOneAndUpdate({ _id: courseID }, { $set: updateCourseInput }, { new: true })
      .exec()
      .catch(err => {
        throw new CourseNotFoundException(courseID);
      });
  }

  async remove(courseID: mongoose.Types.ObjectId): Promise<DeleteQueryDto> {
    // TODO: 권한 검증
    return this.courseModel
      .remove({ _id: courseID })
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
    return await this.courseModel.find().exec();
  }

  async findCourses(searchCourseInput: SearchCourseInput): Promise<Course[]> {
    const { ids, partners, title, isShare, startAt, endAt } = searchCourseInput;
    const query = {
      ...(ids && { _id: { $in: ids } }),
      ...(partners.length > 0 && { partners: { $in: partners } }),
      ...(title && { title }),
      ...(isShare && { isShare }),
      ...(startAt && { startAt: { $gte: startAt } }),
      ...(endAt && { endAt: { $lte: endAt } }),
    };
    return await this.courseModel.find(query).exec();
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
