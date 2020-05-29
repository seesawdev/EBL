const { getUserId, getUserAuth0Id } = require('../utils');
const { fetchApiAccessToken } = require('./managementClient')
const bcrypt = require('bcrypt')
const axios = require('axios');
const createUserData = async (input) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  const data = {
    email: input.email,
    password: hashedPassword,
    avatar: input.avatar,
    name: input.username,
  }
  return data
}
const createAuth0User = async (userData = {}) => {
  const user_metaData = Object.assign({}, userData.metaData)
  const token = await fetchApiAccessToken()
  const headers = {
    Authorization: `Bearer ${process.env.AUTH0_API_TOKEN}`,
    "Content-Type": "application/json",
  };
  const body = {
    connection: "Username-Password-Authentication",
    email: userData.email,
    username: userData.name,
    password: userData.password,
    user_metadata: user_metaData || {},
    email_verified: true,
  };
  try {
    const newUser = await axios.post(
      "https://everybodyleave.auth0.com/api/v2/users",{
           ...body 
      },{
      headers: {
         Authorization: `Bearer ${token}`,
        "Content-type": "application/json"
      },
      }
    );
    const response = await newUser.data;
    console.log(response);
    return await response;
  } catch (err) {
    console.log("There was an error creating Auth0 user", err);
    throw new Error(err);
  }
};

const getAuth0User = async (access_token) => {
  const myHeaders = new Headers();
  myHeaders.append( "Authorization", `Bearer ${access_token}`)
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  const requestOptions = { 
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  }
  try {
    const userinfo = await fetch("https://everybodyleave.auth0.com/userinfo", requestOptions)
    const response = await userinfo.json()
    return await response
  } catch (err) {
    console.log(err);
  }
}


module.exports = { getAuth0User, createAuth0User, createUserData }

