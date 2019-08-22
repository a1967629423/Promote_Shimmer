import { ExpressMiddlewareInterface } from "routing-controllers"
import { NextHandleFunction } from "connect";
import session from 'express-session';
const MySQLStore = require('express-mysql-session')(session);
import Container from 'typedi'
import { ConfigService } from "../../services/ConfigService";
let sessionConfig = Container.get(ConfigService).config.session;
let sessionParser: NextHandleFunction;
if (sessionConfig.store.use === 'mysql') {
    let mysqlOption = sessionConfig.store.mysql;
    let mysqlS = new MySQLStore(mysqlOption)
    sessionParser = <NextHandleFunction>session({
        ...sessionConfig.option,
        store: mysqlS
    });
}
else {
    sessionParser = <NextHandleFunction>session({ ...sessionConfig.option })
}
export class SessionMiddleware implements ExpressMiddlewareInterface {
    Parsers = [sessionParser]
    async use(request: any, response: any, next: (err: any) => any) {
        var promiseArray = this.Parsers.map(v => this.runMiddleware(request, response, v));
        await Promise.all(promiseArray)
        next(null);
    }
    async runMiddleware(request: any, response: any, middleware: NextHandleFunction) {
        return new Promise<any>((res) => {
            middleware(request, response, (err: any) => {
                res(err);
            })
        })
    }
}