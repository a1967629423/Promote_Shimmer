import {Middleware,ExpressMiddlewareInterface} from "routing-controllers"
import bodyParser = require("body-parser");
import { NextHandleFunction } from "connect";

@Middleware({type:"before"})
export class BaseMiddleware implements ExpressMiddlewareInterface
{
    bodyParsers = [bodyParser.json(),bodyParser.urlencoded({extended:true}),bodyParser.text()]
    async use(request:any,response:any,next:(err:any)=>any) {
        var promiseArray = this.bodyParsers.map(v=>this.runMiddleware(request,response,v));
        await Promise.all(promiseArray)
        next(null);
    }
    async runMiddleware(request:any,response:any,middleware:NextHandleFunction)
    {
        return new Promise<any>((res)=>{
            middleware(request,response,(err:any)=>{
                res(err);
            })
        })
    }
}