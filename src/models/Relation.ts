import {Model,Table,Column, Sequelize,ForeignKey, BelongsTo} from "sequelize-typescript";
import { User } from "./User";
import { Vendor } from "./Vendor";

@Table({modelName:"Relation",timestamps:true})
export class Relation extends Model<Relation>
{
    @ForeignKey(()=>User)
    @Column({type:Sequelize.INTEGER})
    userId:number;
    @ForeignKey(()=>Vendor)
    @Column({type:Sequelize.INTEGER})
    vendorId:number;
    @BelongsTo(()=>User,'userId')
    user:User
    @BelongsTo(()=>Vendor,'vendorId')
    vendor:Vendor
}