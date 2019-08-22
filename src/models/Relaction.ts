import {Model,Table,Column, Sequelize,ForeignKey} from "sequelize-typescript";
import { User } from "./User";
import { Vendor } from "./Vendor";

@Table({modelName:"Relaction"})
export class Relaction extends Model<Relaction>
{
    @ForeignKey(()=>User)
    @Column({type:Sequelize.INTEGER})
    userId:number;
    @ForeignKey(()=>Vendor)
    @Column({type:Sequelize.INTEGER})
    vendorId:number;
    @Column({type:Sequelize.DATE})
    createTimestep:Date
}