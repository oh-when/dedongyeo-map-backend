import { HttpException, HttpStatus } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { SpotService } from '../spot/spot.service';
import { Spot, SpotDocument } from '../spot/entities/spot.entity';
import { GroupedSticker, PopulateStickerResult, Sticker } from '../sticker/entities/sticker.entity';
import { CreateCustomSpotInput } from './dto/create-custom-spot.input';
import { UpdateCustomSpotInput } from './dto/update-custom-spot.input';
import { DeleteSpotDto } from '../spot/dto/delete.spot.dto';
import { SearchSpotDto } from './dto/search-spot.dto';
import { PopulateStickerInput } from './dto/populate-sticker-input';

@Resolver(() => Spot)
export class SpotResolver {
  constructor(private readonly spotService: SpotService) {}

  @Query(() => [Spot], {
    name: 'spots',
    description: 'searchSpotDto에 매칭되는 스팟들을 반환합니다.',
  })
  async findAll(
    @Args({ name: 'searchSpotDto', nullable: true })
    searchSpotDto: SearchSpotDto,
  ): Promise<Spot[]> {
    if (searchSpotDto === undefined) {
      return await this.spotService.findAll();
    }

    if ('keyword' in searchSpotDto) {
      if ('x' in searchSpotDto && 'y' in searchSpotDto) {
        return await this.spotService.getNearSpotsByKeyword(searchSpotDto);
      }
      // x,y가 없을 경우
      return await this.spotService.getByKeyword(searchSpotDto);
    }

    // 키워드가 없을 경우
    return await this.spotService.getNearSpots(searchSpotDto);
  }

  @Mutation(() => DeleteSpotDto, {
    description: '(For Debugging) 스팟 하나 삭제',
  })
  async removeSpot(@Args('id', { type: () => String }) id: string) {
    return await this.spotService.remove(id);
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
    description: '커스텀 스팟을 업데이트합니다.',
  })
  async updateCustomSpot(@Args('updateCustomSpotInput') updateCustomSpotInput: UpdateCustomSpotInput): Promise<Spot> {
    const result = await this.spotService.updateCustomSpot(updateCustomSpotInput);
    return result;
  }

  @ResolveField(() => [PopulateStickerResult], {
    description: '해당 설정을 통해 스티커들 정보를 자세히 받아올 수 있습니다.',
  })
  async stickers(
    @Parent() spot: SpotDocument,
    @Args({ name: 'PopulateStickerInput', nullable: true })
    populateStickerInput?: PopulateStickerInput,
  ) {
    if (populateStickerInput?.populate) {
      const tmp = await this.spotService.populateStickers(spot._id, populateStickerInput.mode);
      console.log(tmp);
      return tmp;
    }
    return spot.stickers;
  }
}
