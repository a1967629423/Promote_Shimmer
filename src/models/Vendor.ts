import {Model,Table,Column, Sequelize,ForeignKey, HasMany} from "sequelize-typescript";
import { User } from "./User";
import { Relation } from "./Relation";
@Table({modelName:"Vendor",timestamps:true})
export class Vendor extends Model<Vendor>
{
    @ForeignKey(()=>User)
    @Column({
        type:Sequelize.INTEGER
    })
    userId:number;
    @HasMany(()=>Relation,'vendorId')
    relations:Relation[]


    
}