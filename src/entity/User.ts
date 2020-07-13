import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";
import { ObjectType, Field, Int } from "type-graphql";
import { Settings, metadataObject } from "../graphTypes"










@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column("int", { default: 0 })
    tokenVersion: number;

    @Field({ nullable: true })
    @Column("json", { nullable: true })
    draw_setting: Settings;

    @Field({ nullable: true })
    @Column("jsonb", { nullable: true })
    draw_metadata: metadataObject;

}
