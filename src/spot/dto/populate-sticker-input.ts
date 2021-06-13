import { InputType, Field, registerEnumType } from '@nestjs/graphql';

export enum StickerMode {
  default = 'default',
  group = 'group',
  groupDetail = 'groupDetail',
}

registerEnumType(StickerMode, {
  name: 'StickerMode',
});

@InputType({
  description:
    '스티커들의 자세한 정보를 받기위해 입력하는 입력값입니다. populate를 통해 _id값 이외의 자세한 데이터를 받아올 수 있으며, mode를 통해 스티커 종류별로 그룹화 시킬 수 있습니다.',
})
export class PopulateStickerInput {
  @Field(() => Boolean, {
    description: '스티커들의 자세한 정보를 받을지 여부',
    defaultValue: false,
    nullable: true,
  })
  populate?: boolean;

  @Field(type => StickerMode, {
    description:
      '스티커들 정보를 받을 수 있는 형태 종류입니다. populate가 true인 경우에만 동작합니다. `default`의 경우 스팟에 포함된 모든 스티커 정보를 그룹없이 제공합니다. `group`모드의 경우, 5가지(0,30,50,70,100) 그룹으로 분류해서 스팟들을 분류합니다. `groupDetail`의 경우 모든 스티커 종류를 기준으로 스티커 값을 제공합니다.',
    defaultValue: StickerMode.default,
    nullable: true,
  })
  mode?: StickerMode;
}
