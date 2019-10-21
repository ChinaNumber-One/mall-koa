const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const keys = require('./keys')
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretKey;
const mongoose = require('mongoose')
const User = mongoose.model('user');
module.exports = passport => {
  passport.use(new JwtStrategy(opts, async (jwt_payload, done)=> {
    const user = await User.findById(jwt_payload.id)
    if(user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  }));
}