import {Controller,Post, BodyParam, UseBefore, Session} from 'routing-controllers'
import { SessionMiddleware } from '../../middlewares/local/SessionMiddleware';
// import Container from 'typedi';
import { UserCenterService, UserInfo } from '../../services/UserCenterService';
import { GetUserMiddleware } from '../../middlewares/local/GetUserMiddleware';
import Container from 'typedi';
@Controller('/form')
@UseBefore(SessionMiddleware)
export class formApiController{
    //接收姓名手机号发送到数据库的中间处理过程
    //检查手机号是否是10位阿拉伯数字
    @Post('/upstream')
    @UseBefore(GetUserMiddleware)
    async upsteamAction(@BodyParam('userphone') userphone:string,@BodyParam('username') username:string,@BodyParam('userInfo') userInfo:UserInfo,@Session() session:any)
    {
        var result ={ success: false}
        var vendor = session.vendor;
        console.log(session);
        if(!Number.isNaN(Number.parseInt(userphone))&& userInfo.is_login && !Number.isNaN(Number.parseInt(vendor)))
        {
            session.vendor = null;
            
            if(userphone.length===10)
            {
                var services = Container.get(UserCenterService)
                await services.addUserDetail(userInfo.id,{telephoneNumber:userphone,name:username})
                var relation = await services.getRelation(userInfo.id,vendor);
                if(!relation)
                {
                    await services.makeRelation(userInfo.id,vendor);
                }
                result.success=true
                
            }
        }
        return result
    }

}