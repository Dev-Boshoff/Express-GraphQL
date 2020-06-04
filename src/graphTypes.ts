import { ObjectType, InputType,Field} from "type-graphql";



@ObjectType()
export class rgba {
  @Field()
  r: number

  @Field()
  g:number

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
  g:number

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
}
