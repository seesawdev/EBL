require("dotenv").config();
// const { Secret } = require('jsonwebtoken');
const secret = {
  appSecret: process.env.APP_SECRET,
  refreshSecret: process.env.REFRESH_SECRET
}

module.exports = { secret }