import { ExpressMiddlewareInterface } from "routing-controllers"
import Container from "typedi";
import { UserCenterService } from "../../services/UserCenterService";

export class GetUserMiddleware implements ExpressMiddlewareInterface {

    async use(request: any, response: any, next: (err: any) => any) {
        if(request.session)
        {

        }
        var info = await Container.get(UserCenterService).getUserInfo(request.cookies.wechat_token);
        request.body.userInfo = info.info;
        if(info.model)
        request.session.user={
            id:info.model.id,
            openid:info.model.openId
        }
        next(null);
    }

}