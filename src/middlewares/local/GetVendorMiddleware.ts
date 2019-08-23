import { ExpressMiddlewareInterface } from "routing-controllers"
import Container from "typedi";
import { UserCenterService } from "../../services/UserCenterService";

export class GetVendorMiddleware implements ExpressMiddlewareInterface {

    async use(request: any, response: any, next: (err: any) => any) {
        if(request.session)
        {

        }
        console.log(request.body.userInfo)
        var userInfo = request.body.userInfo;
        if(userInfo.is_login)
        {
            var centerService = Container.get(UserCenterService);
            var id = userInfo.id
            var info = await centerService.getVendorInfo(id);
            if(!info)
            {
                info = await centerService.setToVendro(id);
            }
            request.body.vendorInfo = info;
        }
        next(null);
    }

}