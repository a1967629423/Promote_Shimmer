import { Service } from 'typedi';
import fetch from 'node-fetch'
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';
import { Relation } from '../models/Relation';
type api = {
    success: boolean
}
type UserInfo_Success =
    {
        is_login: true
        openid: string
        unionid: string
        nickname: string
        headimgurl: string
        /**
         * The value of 1 is male and the value of 2 is female
         */
        sex: 1 | 2
        id:number,
    } & api
type UserInfo_Fail =
    {
        is_login: false
    } & api
export type VendorInfo = {
    id:number,
    userId:number
}
export type UserInfo = UserInfo_Success | UserInfo_Fail
@Service()
export class UserCenterService {
    constructor() {

    }
    /**
     * 
     * @param wechat_token wechat tocken
     * @param session receive user database info
     */
    getUserInfo(wechat_token: string): Promise<{info:UserInfo,model:User|null}> {
        
        return new Promise<{info:UserInfo,model:User|null}>((res, rej) => {
            var result:{info:UserInfo,model:User|null} = {info:{success:false,is_login:false},model:null}
            fetch('http://shimmer.neusoft.edu.cn/wechat/web/api/me', { method: 'POST', headers: { 'Cookie': `wechat_token=${wechat_token}` } })
                .then(res => res.json()).then(async (v: UserInfo | undefined) => {
                    if (v && v.success) {
                        result.info = v;
                        if (v.is_login) {
                            //do something
                            var user = await User.findOne({ where: { openId: v.openid } })
                            if (!user) {
                                user = await User.create({
                                    openId:v.openid,
                                    nickName:v.nickname,
                                    headImgUrl:v.headimgurl,
                                });
                                result.model = user;
                            }
                            var successInfo = <UserInfo_Success>result.info;
                            successInfo.id = user.id;
                            if(successInfo.headimgurl!==user.headImgUrl||successInfo.nickname!==user.headImgUrl)
                            {
                                user.headImgUrl = successInfo.headimgurl;
                                user.nickName = successInfo.nickname;
                                await user.save()
                            }
                        }
                        res(result)
                        //res({success:true,is_login:true,openid:'123',unionid:'56',nickname:'a',headimgurl:'a',sex:1});
                    }
                    else {
                        res(result)
                    }
                }).catch(() => {
                    res(result)
                })
        })
    }
    async addUserDetail(id:number,detail:Partial<Record<keyof User,any>>):Promise<boolean>;
    async addUserDetail(id:number,detail:any):Promise<boolean>
    {
        var user = await User.findOne({where:{id:id}});
        if(user && typeof detail === 'object')
        {
            User.create({Info:''})
            for(var key in detail)
            {
                user.set(key,detail[key]);
            }
            await user.save()
        }
        return false;
    }
    async getVendorInfo(user_id:number):Promise<Vendor|null>
    {
        return Vendor.findOne({where:{userId:user_id}})
    }
    async setToVendro(user_id:number):Promise<Vendor>
    {
        var vendor = await Vendor.findOne({where:{userId:user_id}});
        if(!vendor)
        {
            vendor = await Vendor.create({userId:user_id})
        }
        return vendor;
    }
    async makeRelation(user_id:number,vendor_id:number):Promise<Relation>
    async makeRelation(user_id:number,vendor:Vendor):Promise<Relation>
    async makeRelation(user:User,vendor_id:number):Promise<Relation>
    async makeRelation(user:User,vendor:Vendor):Promise<Relation>
    async makeRelation(user:number|User,vendor:number|Vendor):Promise<Relation>
    {
        var _user = typeof user === 'number'?user:Number.parseInt(user.id);
        var _vendor = typeof vendor === 'number'?vendor:Number.parseInt(vendor.id);
        return  Relation.create({userId:_user,vendorId:_vendor,createTimestamp:new Date()})
    }

    async checkRelation(user_id:number,vendor_id:number):Promise<Relation|null>
    {
        return Relation.findOne({where:{userId:user_id,vendorId:vendor_id}})
    }
    async getRelation(option:{userId:number,vendorId:number}):Promise<Relation|null>
    async getRelation(option:{userId:number}):Promise<Vendor[]|null>
    async getRelation(option:{vendorId:number}):Promise<User[]|null>
    async getRelation(option:{userId?:number,vendorId?:number}):Promise<Relation|Vendor[]|User[]|null>
    {
        if(option.userId)
        {
            if(option.vendorId)
            {
                return Relation.findOne({where:{userId:option.userId,vendorId:option.vendorId}});
            }
            var user = await User.findOne({where:{id:option.userId},include:[{model:Relation,include:[Vendor]}]});
            var vendors = null;
            if(user)
            {
                var relations = user.relations;
                vendors = relations.map(v=>v.vendor);
            }
            return vendors;
            
        }else if(option.vendorId)
        {
            var vendor= await Vendor.findOne({where:{id:option.vendorId},include:[{model:Relation,include:[User]}]})
            var users = null
            if(vendor)
            {
                var relations = vendor.relations||[];
                users= relations.map(v=>v.user);
            }
            
            return users;
        }
        return null;
    }
}