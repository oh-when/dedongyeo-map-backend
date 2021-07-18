import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { StickerService } from './sticker.service';
import { Sticker, StickerDocument } from './entities/sticker.entity';
import { CreateStickerInput, SearchStickerInput, UpdateStickerInput } from './dto/sticker.input';
import { SpotService } from '../spot/spot.service';
import { Spot } from '../spot/entities/spot.entity';
import { DeleteQueryDto } from 'src/shared/deleteQuery.dto';

@Resolver(() => Sticker)
export class StickerResolver {
  constructor(private readonly stickerService: StickerService, private readonly spotService: SpotService) {}

  @Mutation(() => Sticker)
  async createSticker(@Args('createStickerInput') createStickerInput: CreateStickerInput): Promise<Sticker> {
    return await this.stickerService.create(createStickerInput);
  }

  @Mutation(() => Sticker)
  async updateSticker(@Args('updateStickerInput') updateStickerInput: UpdateStickerInput): Promise<Sticker> {
    return await this.stickerService.update(updateStickerInput);
  }

  @Query(() => [Sticker], { name: 'stickers', description: 'get Stickers' })
  async findAll(
    @Args({ name: 'searchStickerInput', nullable: true }) searchStickerInput: SearchStickerInput,
  ): Promise<Sticker[]> {
    const inputKeys: string[] = Object.keys(searchStickerInput);
    if (!inputKeys || inputKeys.length === 0) {
      return await this.stickerService.findAll();
    }
    return await this.stickerService.findStickers(searchStickerInput);
  }

  @Query(() => Sticker, { name: 'sticker' })
  findOne(@Args('id', { type: () => ID }) id: mongoose.Types.ObjectId) {
    return this.stickerService.findOne(id);
  }

  @Mutation(() => DeleteQueryDto, {
    name: 'removeSticker',
    description: '(dev)스티커를 삭제합니다.',
  })
  async removeSticker(@Args('id', { type: () => ID }) id: mongoose.Types.ObjectId) {
    return this.stickerService.remove(id);
  }

  @ResolveField(() => Spot, {
    description: 'populate: true 경우 spot_id를 spot 값으로 치환하여 반환합니다.',
  })
  async spot(
    @Parent() sticker: StickerDocument,
    @Args({ name: 'populate', nullable: true, defaultValue: false }) populate?: boolean,
  ) {
    if (populate) {
      return await this.spotService.findOne(sticker.spot as mongoose.Types.ObjectId);
    }
    return sticker.spot;
  }
}
