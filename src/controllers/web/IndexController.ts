import {Controller,Get,Render, Req, Res, CookieParam} from 'routing-controllers'
import { UserCenterService } from '../../services/UserCenterService';
import Container from 'typedi'
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
        return {userInfo}
    }

    @Get('/userCenter')
    @Render('userCenter')
    async userCenterPage(@CookieParam('wechat_token') wechat_token:string) {
        let userInfo =  await Container.get(UserCenterService).getUserInfo(wechat_token);
        return {userInfo}
    }
}