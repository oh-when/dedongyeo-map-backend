import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { SearchService } from '../place/kakaoMapSearch/search.service';

import { CreateSpotInput } from '../spot/dto/create-spot.input';
import { CreateCustomSpotInput } from './dto/create-custom-spot.input';
import { UpdateCustomSpotInput } from './dto/update-custom-spot.input';
import { SearchNearSpotDto, SearchSpotDto } from '../spot/dto/search-spot.dto';
import { PaginatedSpot, Spot, SpotDocument } from '../spot/entities/spot.entity';
import { Place } from '../place/place.entity';
import { Sticker } from '../sticker/entities/sticker.entity';

import {
  CustomSpotNotFoundException,
  CustomSpotUpdateWhenPublicException,
  CustomSpotValidationException,
  SpotDoesNotExistException,
  SpotNoNearException,
  StickerDoesNotExistException,
} from 'src/shared/exceptions';

import { GroupedDetailSticker, GroupedSticker } from 'src/sticker/dto/grouped-sticker.dto';
import { DeleteQueryDto } from 'src/shared/deleteQuery.dto';

@Injectable()
export class SpotService {
  constructor(
    @InjectModel(Spot.name) private spotModel: mongoose.Model<SpotDocument>,
    private readonly searchService: SearchService,
  ) {}

  async findOneOrCreateWithSticker(createSpotInput: CreateSpotInput): Promise<SpotDocument> {
    const place: Place = await this.searchService.getIdenticalPlace(createSpotInput);
    return this.spotModel.findOneAndUpdate(
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

  async appendSticker(spotId: mongoose.Types.ObjectId, stickerId: mongoose.Types.ObjectId): Promise<Spot> {
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

    const spotId = updateCustomSpotInput._id;
    const customSpot: SpotDocument = await this.findOne(spotId);
    if (customSpot == null) throw new CustomSpotNotFoundException(spotId);
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

  async findOne(_id: mongoose.Types.ObjectId): Promise<SpotDocument> {
    return this.spotModel.findById(_id).exec();
  }
  async findAll(searchSpotDto: SearchSpotDto): Promise<PaginatedSpot> {
    const { page: curPage, size: pageSize } = searchSpotDto;

    return this.spotModel
      .aggregate([
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: pageSize * (curPage - 1) }, { $limit: pageSize }],
          },
        },
      ])
      .then((arr: Array<any>) => {
        const result = arr[0];

        const totalCount = result?.metadata[0].total;
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const isEnd = totalPageCount === curPage;
        const spots: Spot[] = result?.data;
        return {
          total_count: totalCount,
          is_end: isEnd,
          total_page_count: totalPageCount,
          cur_page: curPage,
          spots,
        };
      })
      .catch(err => {
        throw new SpotDoesNotExistException();
      });
  }

  async findSpotsByIds(ids: mongoose.Types.ObjectId[]): Promise<Spot[]> {
    return this.spotModel.find({ _id: { $in: ids } }).exec();
  }

  async remove(spotId: mongoose.Types.ObjectId): Promise<DeleteQueryDto> {
    return this.spotModel.remove({ _id: spotId }).exec();
  }

  async validateCustomSpot(spotId: mongoose.Types.ObjectId): Promise<boolean> {
    const spot = await this.findOne(spotId);
    if (spot == null) throw new CustomSpotNotFoundException(spotId);
    return spot?.is_custom && !spot.is_custom_share;
    // TODO: return spot?.is_custom && !spot.is_custom_share && spot.created_by == currentUser;
  }

  async removeCustomSpot(spotId: mongoose.Types.ObjectId): Promise<DeleteQueryDto> {
    if (await this.validateCustomSpot(spotId)) {
      return this.spotModel.remove({ _id: spotId }).exec();
    }
    return { ok: 0, n: 0 };
  }

  async getByKeyword(searchSpotDto: SearchSpotDto): Promise<PaginatedSpot> {
    /*
    mongodb 한국어 쿼리 참고자료
    - https://ip99202.github.io/posts/nodejs,-mongodb-%EA%B2%8C%EC%8B%9C%ED%8C%90-%EA%B2%80%EC%83%89-%EA%B8%B0%EB%8A%A5/
    - https://github.com/Tekiter/EZSET/blob/master/backend/src/api/v1/simple.route.js

    mongodb pagination reference
    - https://stackoverflow.com/questions/48305624/how-to-use-mongodb-aggregation-for-pagination
    */

    const place_name: RegExp = new RegExp(searchSpotDto.keyword);
    const { page: curPage, size: pageSize } = searchSpotDto;
    return this.spotModel
      .aggregate([
        {
          $match: { place_name },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: pageSize * (curPage - 1) }, { $limit: pageSize }],
          },
        },
      ])
      .then((arr: Array<any>) => {
        const result = arr[0];

        const totalCount = result?.metadata[0].total;
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const isEnd = totalPageCount === curPage;
        const spots: Spot[] = result?.data;
        return {
          total_count: totalCount,
          is_end: isEnd,
          total_page_count: totalPageCount,
          cur_page: curPage,
          spots,
        };
      })
      .catch(err => {
        throw new SpotDoesNotExistException();
      });
  }

  async getNearSpots(searchSpotDto: SearchNearSpotDto): Promise<PaginatedSpot> {
    const { radius: maxDistance, page: curPage, size: pageSize, x, y } = searchSpotDto;
    const coordinates = [x, y];
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
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: pageSize * (curPage - 1) }, { $limit: pageSize }],
          },
        },
      ])
      .then((arr: Array<any>) => {
        const result = arr[0];

        const totalCount = result?.metadata[0].total;
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const isEnd = totalPageCount === curPage;
        const spots: Spot[] = result?.data;
        return {
          total_count: totalCount,
          is_end: isEnd,
          total_page_count: totalPageCount,
          cur_page: curPage,
          spots,
        };
      })
      .catch(error => {
        throw new SpotNoNearException(coordinates);
      });
  }

  async getNearSpotsByKeyword(searchSpotDto: SearchNearSpotDto): Promise<PaginatedSpot> {
    const { radius: maxDistance, page: curPage, size: pageSize, x, y, keyword } = searchSpotDto;
    const place_name: RegExp = new RegExp(keyword);
    const coordinates = [x, y];
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
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: pageSize * (curPage - 1) }, { $limit: pageSize }],
          },
        },
      ])
      .then((arr: Array<any>) => {
        const result = arr[0];

        const totalCount = result?.metadata[0].total;
        const totalPageCount = Math.ceil(totalCount / pageSize);
        const isEnd = totalPageCount === curPage;
        const spots: Spot[] = result?.data;
        return {
          total_count: totalCount,
          is_end: isEnd,
          total_page_count: totalPageCount,
          cur_page: curPage,
          spots,
        };
      })
      .catch(error => {
        throw new SpotNoNearException(coordinates);
      });
  }

  async defaultPopulateStickers(spot_id: mongoose.Types.ObjectId): Promise<Sticker[]> {
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
      })
      .catch(err => {
        throw new StickerDoesNotExistException();
      });
  }

  async groupPopulateSticker(spot_id: mongoose.Types.ObjectId): Promise<GroupedSticker> {
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
      .then((arr: Array<any>) => {
        const result = arr[0];
        const stickerIdx = result?._id?.sticker_index;

        return {
          sticker_index: stickerIdx,
          total_count: result.total_count,
        } as GroupedSticker;
      })
      .catch(err => {
        throw new StickerDoesNotExistException();
      });
  }

  async groupDetailPopulateStickers(spot_id: mongoose.Types.ObjectId): Promise<GroupedDetailSticker[]> {
    return await this.spotModel.aggregate([
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
            sweet_percent: '$stickers.sweet_percent',
          },
          total_count: {
            $sum: {
              $const: 1,
            },
          },
        },
      },
    ]);
  }
}
