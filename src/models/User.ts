import {Model,Table,Column, Sequelize, HasMany} from "sequelize-typescript";
import { Relation } from "./Relation";
export interface LiveAddress {
    nation:string,
    province:string
    city:string,
    county:string

}
@Table({modelName:"User",timestamps:true})
export class User extends Model<User> {
    @Column({type:Sequelize.STRING})
    name:string
    @Column({type:Sequelize.STRING})
    nickName:string
    @Column({type:Sequelize.STRING})
    openId:string
    @Column({type:Sequelize.STRING})
    headImgUrl:string
    @Column({type:Sequelize.STRING})
    telephoneNumber:string
    @Column({type:Sequelize.JSON})
    address:LiveAddress
    @Column({type:Sequelize.JSON})
    ext:any
    @HasMany(()=>Relation,'userId')
    relations:Relation[]
}