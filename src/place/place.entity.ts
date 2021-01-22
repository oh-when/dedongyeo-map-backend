import { Field, ObjectType, Float } from "@nestjs/graphql";

// https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword
@ObjectType()
export class Place {
  @Field(() => String, { description: "kakao place id" })
  id: string;

  @Field(() => String)
  place_name: string;

  @Field(() => String, { nullable: true })
  category_name?: string;

  @Field(() => String, { nullable: true })
  category_group_code?: string;

  @Field(() => String, { nullable: true })
  category_group_name?: string;

  @Field(() => String, { nullable: true })
  phone?: string;

  @Field(() => String, { nullable: true })
  address_name?: string;

  @Field(() => String, { nullable: true })
  road_address_name?: string;

  @Field(() => String, { nullable: true })
  place_url?: string;

  @Field(() => String, { nullable: true })
  distance?: string;

  @Field((type) => Float, { nullable: true })
  x?: number;

  @Field((type) => Float, { nullable: true })
  y?: number;
}
