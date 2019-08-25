module.exports = {
  "mysql": {
    dialect: "mysql",
    host: "localhost",
    database: "promote_dev",
    username: "root",
    password: "",
  },
  session:{
    store:{
      mysql:{
        host:"localhost",
        port:3306,
        user:'root',
        password:'',
        database:"promote_session_dev"
      },
      use:'mysql'
    },
    option:{
      key:'promote_session',
      secret:'28ndTjvbYzVp64rr',
      resave:false,
      saveUninitialized:false,
      cookie:{
        maxAge:60*60*1000
      }
    }
  },
  listen: {
    port: Number(process.env.PORT) || 7567,
    host: process.env.HOST || "127.0.0.1",
    trusted: ["loopback"], // http://expressjs.com/en/guide/behind-proxies.html
  },
  webSideFullUrl:'test.shimmer.neusoft.edu.cn/test1',
  webSideRootPath:'/test1/',
  uploadImagePath:'image/',
  uploadAudioPath:'audio/',
  uploadbucketName:'public',
  minioUrl:'https://shimmer.neusoft.edu.cn',
  cors: {
    origin: [
      /weixin\.qq\.com$/,
      /localhost(?:\:\d+)?$/,
      /127\.0\.0\.1(?:\:\d+)?$/,
    ],
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-BIZ-Agent', 'X-BIZ-Token', 'X-TT-TOKEN', 'X-BIZ-AGENT-AUTH', 'X-WECHAT-ID', 'X-Admin-Token'],
    exposedHeaders: [],
    credentials: true,
    maxAge: 86400,
    optionsSuccessStatus: 200,
  },
  cipher:'qwlkejioxc@90'
}