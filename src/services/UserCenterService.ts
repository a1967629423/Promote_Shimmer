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
    } & api
type UserInfo_Fail =
    {
        is_login: false
    } & api
type UserInfo = UserInfo_Success | UserInfo_Fail
@Service()
export class UserCenterService {
    constructor() {

    }
    /**
     * 
     * @param wechat_token wechat tocken
     */
    getUserInfo(wechat_token: string): Promise<UserInfo> {
        return new Promise<UserInfo>((res, rej) => {
            fetch('http://shimmer.neusoft.edu.cn/wechat/web/api/me', { method: 'POST', headers: { 'Cookie': `wechat_token=${wechat_token}` } })
                .then(res => res.json()).then(async (v: UserInfo | undefined) => {
                    if (v && v.success) {
                        if (v.is_login) {
                            //do something
                            var user = await User.findOne({ where: { openId: v.openid } })
                            if (!user) {
                                await User.create({
                                    openid: v.openid,
                                    nickname: v.nickname,
                                    headimgurl: v.headimgurl
                                });
                            }
                        }
                        res(v)
                        //res({success:true,is_login:true,openid:'123',unionid:'56',nickname:'a',headimgurl:'a',sex:1});
                    }
                    else {
                        res({ success: false, is_login: false })
                    }
                }).catch(() => {
                    res({ success: false, is_login: false })
                })
        })
    }
}