import * as mongoose from 'mongoose';
import { Resolver, Query, Mutation, Args, ResolveField, Parent, ID } from '@nestjs/graphql';
import { SpotService } from '../spot/spot.service';
import { PaginatedSpot, Spot, SpotDocument } from '../spot/entities/spot.entity';
import { Sticker } from '../sticker/entities/sticker.entity';
import { CreateCustomSpotInput } from './dto/create-custom-spot.input';
import { UpdateCustomSpotInput } from './dto/update-custom-spot.input';

import { SearchNearSpotDto, SearchSpotDto } from './dto/search-spot.dto';
import { GroupedSticker } from 'src/sticker/dto/grouped-sticker.dto';

import { DeleteQueryDto } from 'src/shared/deleteQuery.dto';

@Resolver(() => Spot)
export class SpotResolver {
  constructor(private readonly spotService: SpotService) {}

  @Query(() => Spot, {
    name: 'spot',
    description: '스팟을 반환합니다.',
  })
  async findOne(@Args('spotId', { type: () => ID }) spotId: mongoose.Types.ObjectId): Promise<Spot> {
    return await this.spotService.findOne(spotId);
  }

  @Query(() => PaginatedSpot, {
    name: 'spots',
    description: '스팟들을 반환합니다.',
  })
  async findAll(
    @Args({ name: 'searchSpotDto', nullable: true })
    searchSpotDto: SearchSpotDto,
  ): Promise<PaginatedSpot> {
    if ('keyword' in searchSpotDto) {
      return await this.spotService.getByKeyword(searchSpotDto);
    }
    return await this.spotService.findAll(searchSpotDto);
  }

  @Query(() => PaginatedSpot, {
    name: 'getNearSpots',
    description: '근처에 있는 spot을 검색합니다.',
  })
  async getNearSpots(
    @Args({ name: 'searchSpotDto', nullable: true })
    searchNearSpotDto: SearchNearSpotDto,
  ): Promise<PaginatedSpot> {
    if ('keyword' in searchNearSpotDto) {
      return await this.spotService.getNearSpotsByKeyword(searchNearSpotDto);
    }
    return await this.spotService.getNearSpots(searchNearSpotDto);
  }

  @Mutation(() => DeleteQueryDto, {
    name: 'removeSpot',
    description: '(For Debugging) 스팟을 삭제합니다',
  })
  async removeSpot(@Args('spotId', { type: () => ID }) spotId: mongoose.Types.ObjectId): Promise<DeleteQueryDto> {
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

  @Mutation(() => DeleteQueryDto, {
    name: 'removeCustomSpot',
    description:
      '커스텀 스팟을 삭제합니다. is_custom==true && is_custom_share==false && created_by==current_user 때만 삭제 가능',
  })
  async removeCustomSpot(@Args('spotId', { type: () => ID }) spotId: mongoose.Types.ObjectId): Promise<DeleteQueryDto> {
    return await this.spotService.removeCustomSpot(spotId);
  }

  @ResolveField(() => [Sticker], {
    description: '해당 설정을 통해 스티커들 정보를 자세히 받아올 수 있습니다.',
  })
  async stickers(
    @Parent() spot: SpotDocument,
    @Args({ name: 'populate', nullable: true, defaultValue: false })
    populate?: boolean,
  ) {
    if (populate) {
      return await this.spotService.defaultPopulateStickers(spot._id);
    }
    return spot.stickers;
  }

  @ResolveField(() => GroupedSticker, {
    name: 'groupedSticker',
    description: '스티커 index에 따라서 그룹된 정보를 자세히 받아올 수 있습니다.',
  })
  async groupedSticker(@Parent() spot: SpotDocument) {
    return await this.spotService.groupPopulateSticker(spot._id);
  }

  // @ResolveField(() => [GroupedDetailSticker]), {
  //   name: 'groupedDetailSticker',

  //   description: '스티커 index에 따라서 그룹된 정보를 자세히 받아올 수 있습니다.',
  // })
  // async groupedDetailSticker(@Parent() spot: SpotDocument) {
  //   return await this.spotService.groupDetailPopulateStickers(spot._id);
  // }
}
