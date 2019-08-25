import {Controller,Post, BodyParam, UseBefore, Session, Get,Res} from 'routing-controllers'
import { SessionMiddleware } from '../../middlewares/local/SessionMiddleware';
// import Container from 'typedi';
import { UserCenterService, UserInfo } from '../../services/UserCenterService';
import { GetUserMiddleware } from '../../middlewares/local/GetUserMiddleware';
import Container from 'typedi';
import captcha from 'svg-captcha'
@Controller('/form')
@UseBefore(SessionMiddleware)
export class formApiController{
    //接收姓名手机号发送到数据库的中间处理过程
    //检查手机号是否是10位阿拉伯数字
    @Post('/upstream')
    @UseBefore(GetUserMiddleware)
    async upsteamAction(@BodyParam('userphone') userphone:string,@BodyParam('username') username:string , @BodyParam('captcha') captcha:string,@BodyParam('userInfo') userInfo:UserInfo,@Session() session:any)
    {
        var result ={ success: false,errorInfo:''}
        var vendor = session.vendor;
        if(!/^1(3|4|5|6|7|8|9)\d{9}$/.test(userphone))
        {
            result.errorInfo = '手机号填写不正确';
            return result;
        }
        if(!userInfo.is_login)
        {
            result.errorInfo = '微信未授权';
            return result;
        }
        if(!vendor)
        {
            result.errorInfo = '链接错误';
            return result;
        }
        if(!captcha||!session.captcha||captcha!==session.captcha)
        {
            result.errorInfo='验证码错误';
            return result;
        }
        session.vendor = null;
        var services = Container.get(UserCenterService)
        await services.addUserDetail(userInfo.id,{telephoneNumber:userphone,name:username})
        var relation = await services.checkRelation(userInfo.id,vendor);
        if(!relation)
        {
            await services.makeRelation(userInfo.id,vendor);
        }
        result.success=true
        return result
    }
    @Get('/captcha')
    async getCaptchaAction(@Session() session:any,@Res() response:any)
    {
        var captchaObj = captcha.createMathExpr({
            noise:3,
            color:true
        });
        session.captcha = captchaObj.text;
        response.type('svg');
        return captchaObj.data;
    }

}