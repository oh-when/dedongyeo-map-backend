import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { SpotService } from '../spot/spot.service';
import { Spot, SpotDocument } from '../spot/entities/spot.entity';
import { GroupedSticker, Sticker } from '../sticker/entities/sticker.entity';
import { CreateCustomSpotInput } from './dto/create-custom-spot.input';
import { UpdateCustomSpotInput } from './dto/update-custom-spot.input';
import { DeleteSpotDto } from '../spot/dto/delete.spot.dto';
import { SearchNearSpotDto, SearchSpotDto } from './dto/search-spot.dto';
import { PopulateStickerInput, StickerMode } from './dto/populate-sticker-input';
import * as mongoose from 'mongoose';

@Resolver(() => Spot)
export class SpotResolver {
  constructor(private readonly spotService: SpotService) {}

  @Query(() => [Spot], {
    name: 'spots',
    description: '스팟들을 반환합니다.',
  })
  async findAll(
    @Args({ name: 'searchSpotDto', nullable: true })
    searchSpotDto: SearchSpotDto,
  ): Promise<Spot[]> {
    if ('keyword' in searchSpotDto) {
      return await this.spotService.getByKeyword(searchSpotDto);
    }
    return await this.spotService.findAll();
  }

  @Query(() => [Spot], {
    name: 'getNearSpots',
    description: '근처에 있는 spot을 검색합니다.',
  })
  async getNearSpots(
    @Args({ name: 'searchSpotDto', nullable: true })
    searchNearSpotDto: SearchNearSpotDto,
  ): Promise<Spot[]> {
    if ('keyword' in searchNearSpotDto) {
      return await this.spotService.getNearSpotsByKeyword(searchNearSpotDto);
    }
    return await this.spotService.getNearSpots(searchNearSpotDto);
  }

  @Mutation(() => DeleteSpotDto, {
    name: 'removeSpot',
    description: '(For Debugging) 스팟을 삭제합니다',
  })
  async removeSpot(@Args('spotId', { type: () => String }) spotId: mongoose.Types.ObjectId): Promise<DeleteSpotDto> {
    return await this.spotService.remove(spotId);
  }

  @Mutation(() => Spot, {
    name: 'createCustomSpot',
    description: '커스텀 스팟을 생성합니다.',
  })
  async createCustomSpot(@Args('createCustomSpotInput') createCustomSpotInput: CreateCustomSpotInput): Promise<Spot> {
    return await this.spotService.createCustomSpot(createCustomSpotInput);
  }

  @Mutation(() => Spot, {
    name: 'updateCustomSpot',
    description:
      '커스텀 스팟을 업데이트합니다. 정책상 is_custom==true && is_custom_share==false && created_by==current_user 때만 삭제 가능',
  })
  async updateCustomSpot(@Args('updateCustomSpotInput') updateCustomSpotInput: UpdateCustomSpotInput): Promise<Spot> {
    const result = await this.spotService.updateCustomSpot(updateCustomSpotInput);
    return result;
  }

  @Mutation(() => DeleteSpotDto, {
    name: 'removeCustomSpot',
    description:
      '커스텀 스팟을 삭제합니다. is_custom==true && is_custom_share==false && created_by==current_user 때만 삭제 가능',
  })
  async removeCustomSpot(
    @Args('spotId', { type: () => String }) spotId: mongoose.Types.ObjectId,
  ): Promise<DeleteSpotDto> {
    return await this.spotService.removeCustomSpot(spotId);
  }

  @ResolveField(() => [Sticker], {
    description: '해당 설정을 통해 스티커들 정보를 자세히 받아올 수 있습니다.',
  })
  async stickers(
    @Parent() spot: SpotDocument,
    @Args({ name: 'populate', nullable: true, defaultValue: false })
    populate?: Boolean,
  ) {
    if (populate) {
      return await this.spotService.populateStickers(spot._id);
    }
    return spot.stickers;
  }

  @ResolveField(() => [GroupedSticker], {
    description: '스티커 index에 따라서 그룹된 정보를 자세히 받아올 수 있습니다.',
  })
  async groupStickers(
    @Parent() spot: SpotDocument,
    @Args({ name: 'PopulateStickerInput', nullable: true })
    populateStickerInput?: PopulateStickerInput,
  ) {
    return await this.spotService.populateStickers(spot._id, populateStickerInput.mode);
  }
}
