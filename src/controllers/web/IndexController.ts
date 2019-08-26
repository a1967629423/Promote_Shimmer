import { Controller, Get, Render, Req, Res, UseBefore, BodyParam, QueryParam, Session } from 'routing-controllers';
import { UserInfo, VendorInfo, UserCenterService } from '../../services/UserCenterService';
import { ConfigService } from '../../services/ConfigService';
import Container from 'typedi'
import qrcode from 'qrcode'
import { GetUserMiddleware } from '../../middlewares/local/GetUserMiddleware';
import { SessionMiddleware } from '../../middlewares/local/SessionMiddleware';
import { GetVendorMiddleware } from '../../middlewares/local/GetVendorMiddleware';
import crypto from 'crypto'
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
    async formPage(@Req() request: any, @Res() resolve: any, @BodyParam('userInfo') userInfo: UserInfo,
        @QueryParam('vendor') vendor: string, @QueryParam('shimmer_disable_cipher') disable_cipher: string, @Session() session: any) {
        var config = Container.get(ConfigService).config;
        if(disable_cipher!=='1')
        {
            if (vendor) {
                session.vendor = Number.parseInt(crypto.createDecipheriv('aes-128-gcm',Buffer.from(config.cipher.key) ,Buffer.from(config.cipher.vi)).update(vendor, 'hex', 'utf8'))
            }
        }
        else
        {
            session.vendor = Number.parseInt(vendor);
        }
        return { userInfo };
    }

    @Get('/poster')
    @Render('poster')
    @UseBefore(SessionMiddleware, GetUserMiddleware, GetVendorMiddleware)
    async posterPage(@BodyParam('userInfo') userInfo: UserInfo, @BodyParam('vendorInfo') vednorInfo: VendorInfo) {
        var config = Container.get(ConfigService).config;
        let fullurl = config.webSideFullUrl;
        let qr = { url: '' }
        if (userInfo.is_login) {
            var c_id = crypto.createCipheriv('aes-128-gcm',Buffer.from(config.cipher.key) ,Buffer.from(config.cipher.vi)).update(vednorInfo.id.toFixed(),'utf8','hex')
            qr.url = await qrcode.toDataURL(`${fullurl}/form?vendor=${c_id}`, { type: 'image/jpeg', margin: 0, width: 200 })
            return { userInfo, qr }
        }
        return { userInfo, qr }
    }

    @Get('/userCenter')
    @Render('userCenter')
    @UseBefore(SessionMiddleware, GetUserMiddleware, GetVendorMiddleware)
    async userCenterPage(@BodyParam('userInfo') userInfo: UserInfo, @BodyParam('vendorInfo') vendorInfo: VendorInfo | null) {
        var service = Container.get(UserCenterService);
        return {
            userInfo,
            isVendor: !!vendorInfo,
            vendor: vendorInfo,
            relation: vendorInfo ?
                await service.getRelation({ vendorId: vendorInfo.id }) :
                userInfo.is_login ?
                await service.getRelation({ userId: userInfo.id }) : []
        };
    }
}