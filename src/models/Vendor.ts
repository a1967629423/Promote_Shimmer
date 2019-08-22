import {Model,Table,Column, Sequelize,ForeignKey} from "sequelize-typescript";
import { User } from "./User";
@Table({modelName:"Vendor"})
export class Vendor extends Model<Vendor>
{
    @ForeignKey(()=>User)
    @Column({
        type:Sequelize.INTEGER
    })
    userid:number;
    
}