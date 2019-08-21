import {Controller,Get,Render, Req, Res, CookieParam} from 'routing-controllers';
import { UserCenterService } from '../../services/UserCenterService';
import {ConfigService} from '../../services/ConfigService';
import Container from 'typedi'
import qrcode from 'qrcode'
@Controller()
export class PageController {
    @Get('/')
    @Render("index")
    async hello() {
        return {}
    }

    @Get('/form')
    @Render('form')
    async formPage(@Req() request:any,@Res() resolve:any,@CookieParam('wechat_token') wechat_token:string) {
        let userInfo =  await Container.get(UserCenterService).getUserInfo(wechat_token);
        if(userInfo.is_login)
        {
            //do something
        }
        return {userInfo};
        
    }

    @Get('/poster')
    @Render('poster')
    async posterPage(@CookieParam('wechat_token') wechat_token:string) {
        let userInfo =  await Container.get(UserCenterService).getUserInfo(wechat_token);
        let fullurl = Container.get(ConfigService).config.webSideFullUrl;
        let qr={url:''}
        if(userInfo.is_login)
        {
            qr.url = await qrcode.toDataURL(`${fullurl}/form?vendor=${userInfo.unionid}`,{type:'image/jpeg',margin:0,width:200})
            return {userInfo,qr}
        }
        return {userInfo}
    }

    @Get('/userCenter')
    @Render('userCenter')
    async userCenterPage(@CookieParam('wechat_token') wechat_token:string) {
        let userInfo =  await Container.get(UserCenterService).getUserInfo(wechat_token);
        return {userInfo}
    }
}