import {Controller, Res, CookieParam, Post, BodyParam, HeaderParam, QueryParam} from 'routing-controllers'
import { Response } from 'express-serve-static-core';
@Controller('/form')
export class formApiController{
    @Post('/upstream')
    upsteamAction(@BodyParam('aa') aa:string,@CookieParam('cc') cc:string,@HeaderParam('ww') ww:string,@QueryParam('ff') ff:string,@Res() response:Response)
    {

    }

}