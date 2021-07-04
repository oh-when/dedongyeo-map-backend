import { ObjectType, Int, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteQueryDto {
  @Field(type => Int, { description: '1 if no errors occurred' })
  ok: number;

  @Field(type => Int, { description: 'the number of documents deleted. Equal to deletedCount.' })
  n: number;
}
