import { ExpressMiddlewareInterface } from "routing-controllers"
import Container from "typedi";
import { UserCenterService } from "../../services/UserCenterService";

export class GetUserMiddleware implements ExpressMiddlewareInterface {

    async use(request: any, response: any, next: (err: any) => any) {
        var info = await Container.get(UserCenterService).getUserInfo(request.cookies.wechat_token);
        request.body.userInfo = info.info;
        if(info.model)
        {
            //console.log(`timestamps:${info.model.createdAt.getFullYear()}-${info.model.createdAt.getMonth()+1}-${info.model.createdAt.getDate()}`)
            request.session.user={
                id:info.model.id,
                openid:info.model.openId
            }
        }
        next(null);
    }

}