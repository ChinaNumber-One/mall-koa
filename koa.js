const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')
const passport = require('koa-passport')
const cors = require('koa2-cors');
const koaBody = require('koa-body');
// config
const db = require('./config/keys').mongoURI
// 实例化 koa
const app = new Koa()
const router = new Router()



// 引入 user.js
const user = require('./routes/api/user')

// 链接数据库
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongodb connected……')
  })
  .catch((error) => {
    console.log(error)
  })
mongoose.set('useFindAndModify', false);
// token 校验 初始化
app.use(passport.initialize())
app.use(passport.session())
// 回调到config文件中
require('./config/passport')(passport);
//设置跨域访问
app.use(cors());
app.use(koaBody({
  multipart: true,
  formidable: {
      maxFileSize: 200*1024*1024  // 设置上传文件大小最大限制，默认2M
  }
}));
// 配置路由地址
router.use('/api/user', user)
// 配置路由
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('server started on ' + port)
})