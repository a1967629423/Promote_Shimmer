import { Controller, UseBefore, BodyParam, Res, Get } from "routing-controllers";
import { SessionMiddleware } from "../../middlewares/local/SessionMiddleware";
import Container from "typedi";
import { UserCenterService, VendorInfo } from "../../services/UserCenterService";
import { GetUserMiddleware } from "../../middlewares/local/GetUserMiddleware";
import { GetVendorMiddleware } from "../../middlewares/local/GetVendorMiddleware";


// type outPutLocation={
//     offset:number
//     pagecount:number
// }
@UseBefore(SessionMiddleware)
@Controller('/center')
export class centerApiController {

    @Get('/getexcel')
    @UseBefore(GetUserMiddleware,GetVendorMiddleware)
    async getExcelAction(@BodyParam('location') outputLoc:any,@BodyParam('vendorInfo') vendorInfo:VendorInfo,@Res() response:any)
    {
        if(vendorInfo)
        {
            var date = new Date();
            var service = Container.get(UserCenterService);
            var filename = `data-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}:${date.getMinutes()}.xlsx`
            response.setHeader('Content-Type','application/download');
            response.setHeader('Content-Type','application/vnd.ms-excel');
            response.setHeader('Content-Disposition',`filename=${filename}`)
            return await service.outputXlsx(vendorInfo.id);
        }
        return 'Not Found';
    }

}