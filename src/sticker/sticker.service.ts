import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { CreateStickerInput, SearchStickerInput, UpdateStickerInput } from './dto/sticker.input';
import { Sticker, StickerDocument } from './entities/sticker.entity';
import { SpotService } from '../spot/spot.service';
import { Spot, SpotDocument } from '../spot/entities/spot.entity';
import { CreateSpotInput } from '../spot/dto/create-spot.input';
import { StickerAlreadyUsedException, StickerNotFoundException } from 'src/shared/exceptions';
import { DeleteQueryDto } from 'src/shared/deleteQuery.dto';

@Injectable()
export class StickerService {
  sweetImgUrl: string;

  constructor(
    @InjectModel(Sticker.name) private stickerModel: mongoose.Model<StickerDocument>,
    private readonly spotService: SpotService,
    private configService: ConfigService,
  ) {
    this.sweetImgUrl = this.configService.get('app.IMG_SWEET_URL');
  }

  getMinStartAt(stickers: StickerDocument[]): Date {
    const startDates = stickers.map(sticker => sticker.startAt);
    const minStartAt = startDates.reduce(function (a, b) {
      return a < b ? a : b;
    });
    return minStartAt;
  }
  getMaxEndAt(stickers: StickerDocument[]): Date {
    const endDates = stickers.map(sticker => sticker.endAt);
    const minEndAt = endDates.reduce(function (a, b) {
      return a > b ? a : b;
    });
    return minEndAt;
  }
  gatherPartners(stickers: StickerDocument[]): Array<String> {
    const partnerArr = stickers.flatMap(sticker => sticker.partners);
    return [...new Set(partnerArr)];
  }

  async create(createStickerInput: CreateStickerInput) {
    /**
     * 0. create sticker object
     * 1. spot find or create spot
     * 2. save spot or update spot
     * 3. save sticker
     */

    const stickerDocument: StickerDocument = new this.stickerModel(createStickerInput);
    let spot: SpotDocument = await this.spotService.findOneOrCreateWithSticker(createStickerInput as CreateSpotInput);
    await this.spotService.appendSticker(spot._id, stickerDocument._id);
    stickerDocument.spot = spot._id;
    return stickerDocument.save();
  }

  async update(updateStickerInput: UpdateStickerInput): Promise<Sticker> {
    const stickerId = updateStickerInput._id;
    return this.stickerModel
      .findOneAndUpdate({ _id: stickerId }, { $set: updateStickerInput }, { new: true })
      .exec()
      .catch(err => {
        throw new StickerNotFoundException(stickerId);
      });
  }

  async consumeStickers(stickers: StickerDocument[]): Promise<void> {
    await this.validateAllStickersNotConsumed(stickers);
    stickers.forEach(async sticker => await sticker.update({ $set: { is_used: true } }).exec());
  }

  async findOne(stickerId: mongoose.Types.ObjectId): Promise<Sticker> {
    return this.stickerModel
      .findById(stickerId)
      .exec()
      .catch(err => {
        throw new StickerNotFoundException(stickerId);
      });
  }

  async findAll(ids: mongoose.Types.ObjectId[] | null = null): Promise<StickerDocument[]> {
    const filters = ids ? { _id: { $in: ids } } : {};
    return this.stickerModel.find(filters).exec();
  }

  async findStickers(searchStickerInput: SearchStickerInput): Promise<Sticker[]> {
    const { is_used, startAt, endAt } = searchStickerInput;
    const query = {
      ...(is_used && { is_used }),
      ...(startAt && { startAt: { $gte: startAt } }),
      ...(endAt && { endAt: { $lte: endAt } }),
    };
    return await this.stickerModel.find(query).exec();
  }

  async getAllSpots(stickerIds: mongoose.Types.ObjectId[]): Promise<Spot[]> {
    const stickers: Sticker[] = await this.findAll(stickerIds);

    const spotIds: mongoose.Types.ObjectId[] = stickers.map(s => s.spot as mongoose.Types.ObjectId);
    return this.spotService.findSpotsByIds(spotIds);
  }

  async validateAllStickersNotConsumed(stickers: Sticker[]): Promise<void> {
    for (let sticker of stickers) {
      console.log(sticker.is_used);
      if (sticker.is_used) throw new StickerAlreadyUsedException(sticker._id);
    }
  }

  async remove(stickerID: mongoose.Types.ObjectId): Promise<DeleteQueryDto> {
    // TODO: 권한 검증
    return this.stickerModel
      .remove({ _id: stickerID })
      .exec()
      .catch(err => {
        throw new StickerNotFoundException(stickerID);
      });
  }
}
