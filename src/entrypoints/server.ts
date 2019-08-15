import express from 'express';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import {Sequelize} from 'sequelize-typescript';
import {useContainer,useExpressServer} from 'routing-controllers';
import cors from 'cors'
import Container from 'typedi'
import {ConfigService} from '../services/ConfigService';
import * as path from 'path'

const configService = Container.get(ConfigService);

useContainer(Container)

const app = express();

if(configService.config.listen.trusted){
    app.set('trust proxy',configService.config.listen.trusted)
}

if(configService.config.cors){
    app.use(cors(configService.config.cors));
}

useExpressServer(app,{
    defaultErrorHandler:false,
    classTransformer:false,
    controllers:[
        path.resolve(__dirname,"../controllers/**/*Controller.js")
    ],
    middlewares:[
        path.resolve(__dirname,'../middlewares/*Middleware.js')
    ]
});

const sequelize = new Sequelize({
    dialect:configService.config.mysql.dialect,
    host:configService.config.mysql.host,
    database:configService.config.database,
    username:configService.config.mysql.username,
    password:configService.config.mysql.password,
    modelPaths:[path.join(__dirname,'../models')]
});
sequelize.sync().then(()=>{
    app.locals.sequelizeSync = true;
    console.log('sequelize sync success');
    app.emit('sequelizeSync');
}).catch(err=>{
    console.log('An error occurred while synchronizing the table:',err)
})
app.set('views',"./view")
app.set('view engine','pug');
app.use('/static',express.static('public'));
app.use('/favicon.ico',express.static('public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.get("/*",function(req,res,next){
    if (!req.complete) {
        res.setHeader('Last-Modified', (new Date()).toUTCString());
        res.setHeader('NO-CACHE', (new Date()).toUTCString());
      }
      next();
});

app.locals.webSideRootPath = configService.config.webSideRootPath;

const config: { port: number, host: string } = configService.config.listen;

app.listen(config.port, config.host, () => {
  console.log(`listening on http://${config.host}:${config.port}`);
});


