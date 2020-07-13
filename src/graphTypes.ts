import { ObjectType, InputType, Field } from "type-graphql";
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';


@InputType()
export class metadataObjectInput {
  @Field(() => GraphQLJSON)
  metadata: object
}

@ObjectType()
export class metadataObject {
  @Field(() => GraphQLJSONObject)
  metadata: object
}


@ObjectType()
export class rgba {
  @Field()
  r: number

  @Field()
  g: number

  @Field()
  b: number

  @Field()
  a: number
}


@InputType()
export class rgbaInput {
  @Field()
  r: number

  @Field()
  g: number

  @Field()
  b: number

  @Field()
  a: number
}


@InputType()
export class SettingsInput {
  @Field()
  fill: rgbaInput

  @Field()
  stroke: rgbaInput

  @Field()
  width: number

  @Field()
  snapping: boolean

  @Field()
  snappingTolerance: number

  @Field({ nullable: true, defaultValue: 0 })
  label: string

  @Field({ nullable: true, defaultValue: 0 })
  labelwidth: number
}



@ObjectType()
export class Settings {
  @Field()
  fill: rgba

  @Field()
  stroke: rgba

  @Field()
  width: number

  @Field()
  snapping: boolean

  @Field()
  snappingTolerance: number

  @Field({ nullable: true, defaultValue: "" })
  label: string

  @Field({ nullable: true, defaultValue: 0 })
  labelwidth: number
}
