import {Controller,Post, BodyParam, Req, UseBefore,} from 'routing-controllers'

import { User } from '../../models/User';
import bodyParser = require('body-parser');
@Controller('/form')
export class formApiController{
    //接收姓名手机号发送到数据库的中间处理过程
    //检查手机号是否是10位阿拉伯数字
    @Post('/upstream')
    @UseBefore(bodyParser.urlencoded({extended:true}))
    async upsteamAction(@BodyParam('userphone') userphone:string,@BodyParam('username') username:string,@Req() request:any)
    {
        var result ={ success: false}

        // console.log(request)
        if(!Number.isNaN(Number.parseInt(userphone)))
        {
            console.log((userphone+"").length)
            console.log(userphone)
            if(userphone.length===10)
            {
                console.log((userphone+"").length)
                console.log(userphone)
               await User.create({name:username,telephoneNumber:userphone})
                result.success=true
            }
        }
        return result
        


    }

}