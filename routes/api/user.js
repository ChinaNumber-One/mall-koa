const Router = require('koa-router')
const router = new Router()
const jwt = require('jsonwebtoken')
const passport = require('koa-passport')
const fs = require('fs')
// model
const User = require('../../models/User')
const Address = require('../../models/Address')
// tools
const keys = require('../../config/keys')
const tools = require('../../config/tools')
/*
 * @route GET api/user/test
 * @desc 测试接口地址
 */
router.get('/test', async ctx => {
  // ctx.status = 200;
  ctx.body = {
    msg: 'UserApi works……'
  }
})
/*
 * @route POST api/user/register
 * @desc 注册接口地址
 */
router.post('/register', async ctx => {
  //存储到数据库  --> 先查
  const findResult = await User.find({ phone: ctx.request.body.phone })
  if (findResult.length > 0) {
    ctx.status = 200;
    ctx.body = {
      status:0,
      msg: '该手机号已被占用！'
    }
  } else {
    // 文件格式存储   现接口一定接收的是 字符串类型
    // if(ctx.request.files&&ctx.request.files.avatar) {
    //   const file = ctx.request.files.avatar
    //   path = `https://static.wordming.cn/img/${file.name}`
    //   const reader = fs.createReadStream(file.path)
    //   const upStream = fs.createWriteStream(`/var/static/img/${file.name}`); 
    //   reader.pipe(upStream);
    // }
    let str = Math.random().toString(36).slice(-8);
    let path = `https://static.wordming.cn/img/shuai.jpg`
    const isBase64 = ctx.request.body.avatar.indexOf('data:')!==-1 && ctx.request.body.avatar.indexOf('base64')!==-1
    if(isBase64) {
      const base64 = ctx.request.body.avatar.replace(/^data:image\/\w+;base64,/, "");//去掉图片base64码前面部分data:image/png;base64
      let dataBuffer = new Buffer.from(base64, 'base64');
      fs.writeFile('/var/static/img/avatar/'+ ctx.request.body.phone + '_' + str +'.jpg',dataBuffer,(error)=>{
        if(error) {
          ctx.body = JSON.stringify(error)
          return;
        }
      })
      path = `https://static.wordming.cn/img/avatar/${ctx.request.body.phone}_${str}.jpg`
    } else {
      path = `${ctx.request.body.avatar}`
    }
    const newUser = new User({
      name: ctx.request.body.name,
      phone: ctx.request.body.phone,
      password: tools.enbcrypt(ctx.request.body.password),
      avatar:path
    })
    // 存储
    await newUser.save().then(user => {
      ctx.status = 200;
      ctx.body = {
        status:2,
        msg: 'success',
      }
    }).catch(error => {
      ctx.status = 200;
      ctx.body = {
        status:1,
        msg: 'save error'
      }
    })
  }
})
/*
 * @route POST api/user/login
 * @desc 登录接口地址 返回token
 */
router.post('/login', async ctx => {
  const findResult = await User.find({ phone: ctx.request.body.phone })
  const password = ctx.request.body.password
  const user = findResult[0]
  if (findResult.length === 0) {
    ctx.status = 200;
    ctx.body = {
      status:0,
      msg: '用户不存在！'
    }
  } else {
    let result = tools.passwordVerify(password, user.password)
    if(result) {
      const payload = {id:user.id,name:user.name,phone:user.phone};
      const token = jwt.sign(payload,keys.secretKey,{expiresIn:24*60*60})
      ctx.status = 200
      ctx.body = {
        status:2,
        msg:'success',
        token:"Bearer "+token
      }
    } else {
      ctx.status = 200
      ctx.body = {
        status:1,
        msg:'密码错误！'
      }
    }
  }
})
/*
 * @route GET api/user/current
 * @desc 用户信息接口地址 返回用户信息
 * @access 私有接口
 */
router.get('/current',passport.authenticate('jwt', { session: false }),async ctx=>{
  ctx.body = {
    msg:true ,
    userInfo:{
      id:ctx.state.user.id,
      name:ctx.state.user.name,
      phone:ctx.state.user.phone,
      avatar:ctx.state.user.avatar,
      sex: ctx.state.user.sex,
      birth: ctx.state.user.birth,
      areaText: ctx.state.user.areaText,
      areaCode: ctx.state.user.areaCode,
    }
  }
})
/*
 * @route POSt api/user/update
 * @desc 修改用户基本信息接口
 * @access 私有接口
 */
router.post('/update',passport.authenticate('jwt', { session: false }),async ctx=>{
  let updateData = {$set : ctx.request.body};
  
  if(ctx.request.body.avatar){
    let str = Math.random().toString(36).slice(-8);
    let path = `https://static.wordming.cn/img/shuai.jpg`
    const isBase64 = ctx.request.body.avatar.indexOf('data:')!==-1 && ctx.request.body.avatar.indexOf('base64')!==-1
    if(isBase64) {
      const base64 = ctx.request.body.avatar.replace(/^data:image\/\w+;base64,/, "");//去掉图片base64码前面部分data:image/png;base64
      let dataBuffer = new Buffer.from(base64, 'base64');
      fs.writeFile('/var/static/img/avatar/'+ ctx.state.user.phone + '_' + str +'.jpg',dataBuffer,(error)=>{
        if(error) {
          ctx.body = JSON.stringify(error)
          return;
        }
      })
      path = `https://static.wordming.cn/img/avatar/${ctx.state.user.phone}_${str}.jpg`
    } else {
      path = `${ctx.request.body.avatar}`
    }
    updateData = {$set : {avatar:path}};
  }
  const findResult = await User.findOneAndUpdate({_id:ctx.state.user._id},updateData)
  if(findResult) {
    ctx.body = {
      status:1,
      msg:'保存成功'
    }
  } else {
    ctx.body = {
      status:0,
      msg:'保存失败'
    }
  }
})
/*
 * @route POST api/user/update
 * @desc 修改登录手机号接口
 */
router.post('/changePhone',async ctx=>{
  const findResult = await User.find({ phone: ctx.request.body.phone })
  const password = ctx.request.body.password
  const user = findResult[0]
  if (findResult.length === 0) {
    ctx.status = 200;
    ctx.body = {
      status:0,
      msg: '用户不存在！'
    }
  } else {
    let result = tools.passwordVerify(password, user.password)
    if(result) {
      let updateData = {$set : {phone:ctx.request.body.phoneN}};
      let changRes = await User.findOneAndUpdate({_id:user._id},updateData)
      if(changRes) {
        ctx.body = {
          status:1,
          msg:'修改成功'
        }
      } else {
        ctx.body = {
          status:0,
          msg:'修改失败'
        }
      }
    } else {
      ctx.status = 200
      ctx.body = {
        status:0,
        msg:'密码错误！'
      }
    }
  }
})
/*
 * @route POST api/user/update
 * @desc 修改密码接口
 */
router.post('/changePassword',async ctx=>{
  if(ctx.request.body.password === ctx.request.body.passwordN) {
    return ctx.body = {
      state:0,
      msg: '新密码与原密码相同！'
    }
  }
  const findResult = await User.find({ phone: ctx.request.body.phone })
  const password = ctx.request.body.password
  const user = findResult[0]
  if (findResult.length === 0) {
    ctx.status = 200;
    ctx.body = {
      status:0,
      msg: '用户不存在！'
    }
  } else {
    let result = tools.passwordVerify(password, user.password)
    if(result) {
      let updateData = {$set : {password:tools.enbcrypt(ctx.request.body.passwordN)}};
      let changRes = await User.findOneAndUpdate({_id:user._id},updateData)
      if(changRes) {
        ctx.body = {
          status:1,
          msg:'修改成功'
        }
      } else {
        ctx.body = {
          status:0,
          msg:'修改失败'
        }
      }
    } else {
      ctx.status = 200
      ctx.body = {
        status:0,
        msg:'密码错误！'
      }
    }
  }
})

/*
 * @route POST api/user/getAddress
 * @desc 获取 收货地址 接口
 * @access 私有接口
 */
router.get('/getAddress',passport.authenticate('jwt', { session: false }),async ctx=>{
  const findResult = await Address.find({ userId: ctx.state.user.id })
  ctx.body = {
    status: 1,
    list:findResult
  }
})

/*
 * @route POST api/user/addAddress
 * @desc 添加 收货地址 接口
 * @access 私有接口
 */

router.post('/addAddress',passport.authenticate('jwt', { session: false }),async ctx=>{
  const newAddress = new Address({
    userId:ctx.state.user.id,
    ...ctx.request.body
  })
  if(ctx.request.body.isDefault) {
    await Address.updateMany({isDefault:true},{isDefault:false})
  }
  await newAddress.save().then(user => {
    ctx.status = 200;
    ctx.body = {
      status:1,
      msg: 'success',
    }
  }).catch(error => {
    ctx.status = 200;
    ctx.body = {
      status:0,
      msg: error
    }
  })
})

/*
 * @route POST api/user/editorAddress
 * @desc 编辑 收货地址 接口
 * @access 私有接口
 */

router.post('/editorAddress',passport.authenticate('jwt', { session: false }),async ctx=>{
  let updateData = {$set : ctx.request.body};
  if(ctx.request.body.isDefault) {
    await Address.updateMany({isDefault:true},{isDefault:false})
  }
  const findResult = await Address.findOneAndUpdate({_id:ctx.request.body._id},updateData)
  if(findResult) {
    ctx.body = {
      status:1,
      msg:'保存成功'
    }
  } else {
    ctx.body = {
      status:0,
      msg:'保存失败'
    }
  }
})
/*
 * @route POST api/user/deleteAddress
 * @desc 编辑 收货地址 接口
 * @access 私有接口
 */

router.post('/deleteAddress',passport.authenticate('jwt', { session: false }),async ctx=>{
  const findResult = await Address.findOneAndRemove({_id:ctx.request.body.id})
  if(findResult) {
    ctx.body = {
      status:1,
      msg:'删除成功'
    }
  } else {
    ctx.body = {
      status:0,
      msg:'删除失败'
    }
  }
})
module.exports = router.routes()