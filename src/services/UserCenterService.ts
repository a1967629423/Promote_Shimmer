import { Service } from 'typedi';
import fetch from 'node-fetch'
import { User } from '../models/User';
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
                            (<UserInfo_Success>result.info).id = user.id;
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
    async addUserDetail<A>(id:number,detail:A):Promise<boolean>;
    async addUserDetail(id:number,detail:any):Promise<boolean>
    {
        var user = await User.findOne({where:{id:id}});
        
        if(user && typeof detail === 'object')
        {
            User.create({Info:''})
            for(var key in detail)
            {
                console.log(`set${key}=${detail[key]}`)
                user.set(key,detail[key]);
            }
            await user.save()
        }
        return false;
    }
}