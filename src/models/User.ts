import {Model,Table,Column, Sequelize} from "sequelize-typescript";
export interface LiveAddress {
    nation:string,
    province:string
    city:string,
    county:string

}
@Table({modelName:"User"})
export class User extends Model<User> {
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
}