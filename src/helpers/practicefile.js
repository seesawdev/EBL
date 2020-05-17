const { getUserId, getUserAuth0Id } = require('../utils')


const getAuth0User = async (access_token) => {

var options = {
  method: "GET",
  headers: {
    Authorization:
      `Bearer ${access_token}`,
  },
};
const userinfo = await fetch("https://everybodyleave.auth0.com/userinfo", options)
const response = await userinfo.json()
return await response
}
module.exports = { getAuth0User }