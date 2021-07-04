import { Injectable } from '@nestjs/common';
import * as mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { CreateStickerInput, UpdateStickerInput } from './dto/sticker.input';
import { Sticker, StickerDocument } from './entities/sticker.entity';
import { SpotService } from '../spot/spot.service';
import { Spot, SpotDocument } from '../spot/entities/spot.entity';
import { CreateSpotInput } from '../spot/dto/create-spot.input';
import { StickerAlreadyUsedException, StickerNotFoundException } from 'src/shared/exceptions';

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

  async consumeStickers(stickers: mongoose.Types.ObjectId[]): Promise<any> {
    await this.validateAllStickersNotConsumed(stickers);

    return this.stickerModel
      .updateMany(
        {
          _id: {
            $in: stickers,
          },
        },
        { $set: { is_used: true } },
      )
      .exec();
  }

  async findOne(stickerId: mongoose.Types.ObjectId): Promise<Sticker> {
    return this.stickerModel
      .findById(stickerId)
      .exec()
      .catch(err => {
        throw new StickerNotFoundException(stickerId);
      });
  }

  async findAll(ids: mongoose.Types.ObjectId[] | null = null): Promise<Sticker[]> {
    const filters = ids ? { _id: { $in: ids } } : {};
    return this.stickerModel.find(filters).exec();
  }

  async getAllSpots(stickerIds: mongoose.Types.ObjectId[]): Promise<Spot[]> {
    const stickers: Sticker[] = await this.findAll(stickerIds);

    const spotIds: mongoose.Types.ObjectId[] = stickers.map(s => s.spot as mongoose.Types.ObjectId);
    return this.spotService.findSpotsByIds(spotIds);
  }

  async validateAllStickersNotConsumed(stickerIDs: mongoose.Types.ObjectId[]): Promise<void> {
    const stickers: Sticker[] = await this.findAll(stickerIDs);
    for (let sticker of stickers) {
      if (sticker.is_used === true) throw new StickerAlreadyUsedException(sticker._id);
    }
  }
}
