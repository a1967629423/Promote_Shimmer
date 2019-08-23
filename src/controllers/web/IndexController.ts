import { Controller, Get, Render, Req, Res, UseBefore, BodyParam, QueryParam, Session } from 'routing-controllers';
import { UserInfo, VendorInfo } from '../../services/UserCenterService';
import { ConfigService } from '../../services/ConfigService';
import Container from 'typedi'
import qrcode from 'qrcode'
import { GetUserMiddleware } from '../../middlewares/local/GetUserMiddleware';
import { SessionMiddleware } from '../../middlewares/local/SessionMiddleware';
import { GetVendorMiddleware } from '../../middlewares/local/GetVendorMiddleware';
@Controller()
export class PageController {
    @Get('/')
    @Render("index")
    async hello() {
        return {}
    }

    @Get('/form')
    @Render('form')
    @UseBefore(SessionMiddleware, GetUserMiddleware)
    async formPage(@Req() request: any, @Res() resolve: any, @BodyParam('userInfo') userInfo: UserInfo, @QueryParam('vendor') vendor: string, @Session() session: any) {
        if (!Number.isNaN(Number.parseInt(vendor)))
            session.vendor = Number.parseInt(vendor);
        return { userInfo };

    }

    @Get('/poster')
    @Render('poster')
    @UseBefore(SessionMiddleware, GetUserMiddleware, GetVendorMiddleware)
    async posterPage(@BodyParam('userInfo') userInfo: UserInfo, @BodyParam('vendorInfo') vednorInfo: VendorInfo) {
        let fullurl = Container.get(ConfigService).config.webSideFullUrl;
        let qr = { url: '' }
        if (userInfo.is_login) {
            qr.url = await qrcode.toDataURL(`${fullurl}/form?vendor=${vednorInfo.id}`, { type: 'image/jpeg', margin: 0, width: 200 })
            return { userInfo, qr }
        }
        return { userInfo, qr }
    }

    @Get('/userCenter')
    @Render('userCenter')
    @UseBefore(SessionMiddleware, GetUserMiddleware)
    async userCenterPage(@BodyParam('userInfo') userInfo: UserInfo) {
        return { userInfo }
    }
}