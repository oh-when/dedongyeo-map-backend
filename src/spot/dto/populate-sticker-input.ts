import { InputType, Field, registerEnumType } from '@nestjs/graphql';

export enum StickerMode {
  group = 'group',
  groupDetail = 'groupDetail',
}

registerEnumType(StickerMode, {
  name: 'StickerMode',
});
