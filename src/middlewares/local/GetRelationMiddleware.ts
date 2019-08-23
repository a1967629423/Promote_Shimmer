import Container from "typedi";
import { UserCenterService } from "../../services/UserCenterService";
import { NextHandleFunction, NextFunction } from "connect";

// export class GetRelationMiddleware implements ExpressMiddlewareInterface {

//     async use(request: any, response: any, next: (err: any) => any) {
//         var vendor = request.query.vendor||request.body.vendorInfo.id;
//         var user:number = request.body.userInfo.id;
//         var server = Container.get(UserCenterService);
//         var relation = server.getRelation(user,vendor)
//         if(!relation)
//         {
//             relation = server.makeRelation(user,vendor);
//         }
//         request.body.relationInfo = relation;
//         next(null);
//     }

// }
type relationGetOption = {
    Vendor?:{
        QueryString:string
    },
    User?:{
        QueryString:string
    }
    
}
export function GetRelationMiddleware(option:relationGetOption={}): NextHandleFunction {
    return async (req: any, res: any, next: NextFunction) => {
        var vendor_id =  option.Vendor?Number.parseInt( req.query[option.Vendor.QueryString]):req.body.vendorInfo.id
        var user_id = option.User?Number.parseInt(req.query[option.User.QueryString]):req.body.userInfo.id;
        var server = Container.get(UserCenterService);
        var relation = await server.getRelation(user_id,vendor_id);
        if(!relation)
        {
            relation = await server.makeRelation(user_id,vendor_id);
        }
        req.body.relationInfo = relation;
        next(null);

    }
}