import { Service } from 'typedi';
import fetch from 'node-fetch'
type api = {
    success:boolean
}
type UserInfo_Success =
{
    is_login:true
    openid:string
    unionid:string
    nickname:string
    headimgurl:string
    /**
     * The value of 1 is male and the value of 2 is female
     */
    sex:number
} & api
type  UserInfo_Fail =
{
    is_login:false
} & api
type UserInfo = UserInfo_Success | UserInfo_Fail
@Service()
export class UserCenterService
{
    constructor() {
        
    }
    /**
     * 
     * @param wechat_token wechat tocken
     */
    getUserInfo(wechat_token:string):Promise<UserInfo>
    {
        return new Promise<UserInfo>((res,rej)=>{
            fetch('http://shimmer.neusoft.edu.cn/wechat/web/api/me',{method:'POST',headers:{'Cookie':`wechat_token=${wechat_token}`}})
            .then(res=>res.json()).then((v:UserInfo|undefined)=>{
                if(v&&v.success)
                {
                    if(v.is_login)
                    {
                        //do something
                    }
                    res(v)
                }
                else
                {
                    res({success:false,is_login:false})
                }
            }).catch(()=>{
                res({success:false,is_login:false})
            })
        })
    }
}