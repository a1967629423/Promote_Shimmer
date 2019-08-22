import {Controller,Post, BodyParam, UseBefore} from 'routing-controllers'
import { SessionMiddleware } from '../../middlewares/local/SessionMiddleware';
import Container from 'typedi';
import { UserCenterService, UserInfo } from '../../services/UserCenterService';
import { GetUserMiddleware } from '../../middlewares/local/GetUserMiddleware';
@Controller('/form')
@UseBefore(SessionMiddleware)
export class formApiController{
    //接收姓名手机号发送到数据库的中间处理过程
    //检查手机号是否是10位阿拉伯数字
    @Post('/upstream')
    @UseBefore(GetUserMiddleware)
    async upsteamAction(@BodyParam('userphone') userphone:string,@BodyParam('username') username:string,@BodyParam('userInfo') userInfo:UserInfo)
    {
        var result ={ success: false}
        if(!Number.isNaN(Number.parseInt(userphone))&& userInfo.is_login)
        {
            if(userphone.length===10)
            {
                await Container.get(UserCenterService).addUserDetail(userInfo.id,{telephoneNumber:userphone,name:username})
                result.success=true
            }
        }
        return result
    }

}