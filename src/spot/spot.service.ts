import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Mongoose, Types } from 'mongoose';
import { SearchService } from '../place/kakaoMapSearch/search.service';

import { CreateSpotInput } from '../spot/dto/create-spot.input';
import { CreateCustomSpotInput } from './dto/create-custom-spot.input';
import { UpdateCustomSpotInput } from './dto/update-custom-spot.input';
import { SearchSpotDto } from '../spot/dto/search-spot.dto';
import { Spot, SpotDocument } from '../spot/entities/spot.entity';
import { Place } from '../place/place.entity';
import { GroupedSticker, Sticker } from '../sticker/entities/sticker.entity';

import {
  CustomSpotUpdateWhenPublicException,
  CustomSpotValidationException,
  SpotNoNearException,
  SpotNotFoundException,
} from 'src/shared/exceptions';
import { StickerMode } from './dto/populate-sticker-input';

@Injectable()
export class SpotService {
  constructor(
    @InjectModel(Spot.name) private spotModel: Model<SpotDocument>,
    private readonly searchService: SearchService,
  ) {}

  async findOneOrCreateWithSticker(createSpotInput: CreateSpotInput): Promise<SpotDocument> {
    const place: Place = await this.searchService.getIdenticalPlace(createSpotInput);
    return await this.spotModel.findOneAndUpdate(
      { place_id: place.id },
      {
        ...place,
        ...createSpotInput,
        place_id: place.id,
        location: { type: 'Point', coordinates: [place.x, place.y] }, //https://stackoverflow.com/questions/54254763/missing-the-following-properties-from-type-location-location-ancestororigins
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );
  }

  async appendSticker(spotId: Types.ObjectId, stickerId: Types.ObjectId): Promise<Spot> {
    return this.spotModel.findOneAndUpdate({ _id: spotId }, { $push: { stickers: stickerId } });
  }

  async createCustomSpot(createCustomSpotInput: CreateCustomSpotInput): Promise<Spot> {
    if (!createCustomSpotInput.is_custom) throw new CustomSpotValidationException();

    const createSpotDto = {
      location: {
        type: 'Point',
        coordinates: [createCustomSpotInput.x, createCustomSpotInput.y],
      },
      ...createCustomSpotInput,
    };

    const customSpotDocument: SpotDocument = await new this.spotModel(createSpotDto);
    // 커스텀 스팟의 경우 place_id에 spot_id를 넣는다. (unique key 확보)
    // 추가로 카카오 place_id는 string이기 때문에 mongodb objectId와 매칭될 수 없으므로 unique 만족한다.
    customSpotDocument.place_id = customSpotDocument._id.toString();

    return customSpotDocument.save();
  }

  async updateCustomSpot(updateCustomSpotInput: UpdateCustomSpotInput): Promise<Spot> {
    if (!updateCustomSpotInput.is_custom) throw new CustomSpotValidationException();

    const customSpot: SpotDocument = await this.findOne(updateCustomSpotInput._id);

    if (customSpot.is_custom_share) throw new CustomSpotUpdateWhenPublicException();

    updateCustomSpotInput['location'] = {
      coordinates: [updateCustomSpotInput.x, updateCustomSpotInput.y],
    };

    return this.spotModel.findOneAndUpdate(
      { _id: updateCustomSpotInput._id },
      { $set: updateCustomSpotInput },
      { new: true },
    );
  }

  async findOne(_id: Types.ObjectId): Promise<SpotDocument> {
    return this.spotModel.findById(_id).exec();
  }

  async findAll(ids: Types.ObjectId[] | null = null): Promise<Spot[]> {
    const filters = ids ? { _id: { $in: ids } } : {};
    return this.spotModel.find(filters).exec();
  }

  async remove(place_id: string) {
    return this.spotModel.remove({ place_id }).exec();
  }

  async getByKeyword(searchSpotDto: SearchSpotDto): Promise<Spot[]> {
    /*
    mongodb 한국어 쿼리 참고자료
    - https://ip99202.github.io/posts/nodejs,-mongodb-%EA%B2%8C%EC%8B%9C%ED%8C%90-%EA%B2%80%EC%83%89-%EA%B8%B0%EB%8A%A5/
    - https://github.com/Tekiter/EZSET/blob/master/backend/src/api/v1/simple.route.js
    */
    const place_name: RegExp = new RegExp(searchSpotDto.keyword);
    return this.spotModel
      .find({ place_name })
      .exec()
      .catch(err => {
        throw new SpotNotFoundException(place_name);
      });
  }

  async getNearSpots(searchSpotDto: SearchSpotDto): Promise<Spot[]> {
    const maxNumSpots: number = 15;
    const maxDistance: number = searchSpotDto.radius;
    const coordinates = [searchSpotDto.x, searchSpotDto.y];
    return this.spotModel
      .aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates,
            },
            distanceField: 'dist.calculated',
            maxDistance,
            includeLocs: 'dist.location',
            spherical: true,
          },
        },
        { $limit: maxNumSpots },
      ])
      .then(response => response)
      .catch(error => {
        throw new SpotNoNearException(coordinates);
      });
  }

  async getNearSpotsByKeyword(searchSpotDto: SearchSpotDto): Promise<Spot[]> {
    const maxNumSpots: number = 15;
    const maxDistance: number = searchSpotDto.radius;
    const place_name: RegExp = new RegExp(searchSpotDto.keyword);
    const coordinates = [searchSpotDto.x, searchSpotDto.y];
    return this.spotModel
      .aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates,
            },
            distanceField: 'dist.calculated',
            maxDistance,
            query: { place_name },
            includeLocs: 'dist.location',
            spherical: true,
          },
        },
        { $limit: maxNumSpots },
      ])
      .then(response => response)
      .catch(error => {
        throw new SpotNoNearException(coordinates);
      });
  }

  async populateStickers(spot_id: Types.ObjectId, mode: StickerMode | undefined = undefined): Promise<any> {
    if (mode === StickerMode.group) return this.groupPopulateStickers(spot_id);
    // if (mode === StickerMode.groupDetail) return this.groupDetailPopulateStickers(spot_id);
    return this.defaultPopulateStickers(spot_id);
  }

  async groupPopulateStickers(spot_id: Types.ObjectId): Promise<any> {
    return this.spotModel
      .aggregate([
        {
          $match: { _id: spot_id },
        },
        {
          $lookup: {
            from: 'stickers',
            localField: 'stickers',
            foreignField: '_id',
            as: 'stickers',
          },
        },
        {
          $unwind: '$stickers',
        },
        {
          $group: {
            _id: {
              sticker_index: '$stickers.sticker_index',
            },
            total_count: {
              $sum: {
                $const: 1,
              },
            },
          },
        },
      ])
      .catch(err => console.log(err));
  }

  // async groupDetailPopulateStickers(spot_id: Types.ObjectId): Promise<Sticker[]> {
  //   return this.spotModel
  //     .aggregate([
  //       {
  //         $match: { _id: spot_id },
  //       },
  //       {
  //         $lookup: {
  //           from: 'stickers',
  //           localField: 'stickers',
  //           foreignField: '_id',
  //           as: 'stickers',
  //         },
  //       },
  //       {
  //         $unwind: '$stickers',
  //       },
  //       {
  //         $group: {
  //           _id: {
  //             sticker_index: '$stickers.sticker_index',
  //           },
  //           total_count: {
  //             $sum: {
  //               $const: 1,
  //             },
  //           },
  //         },
  //       },
  //     ])
  //     .then(response => {
  //       return response[0].stickers;
  //     });
  // }

  async defaultPopulateStickers(spot_id: Types.ObjectId): Promise<Sticker[]> {
    return this.spotModel
      .aggregate([
        {
          $match: { _id: spot_id },
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
      .then(response => {
        return response[0].stickers;
      });
  }
}
