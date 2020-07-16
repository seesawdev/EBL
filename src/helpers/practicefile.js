const { getUserId, getUserAuth0Id } = require('../utils');
const { fetchApiAccessToken } = require('./managementClient')
const bcrypt = require('bcrypt')
const axios = require('axios');
const createUserData = async (input) => {
const { config }  = require('./auth0Config')
  const data = {
    email: input.email,
    password: input.password,
    // avatar: input.avatar || null,
    name: input.username,
    metaData: input.metaData || {}
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
    email: userData.email || null,
    // avatar: userData.avatar || null,
    username: userData.name,
    password: userData.password,
    user_metadata: { user_metaData } || {},
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
    const response = await userinfo.json()[0]
    return await response
  } catch (err) {
    console.log(err);
  }
}
const loginAfterSignup =  async (email, password) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  
  const urlencoded = new URLSearchParams()
  urlencoded.append("client_id", `${process.env.MACHINE_CLIENT_ID}`)
  urlencoded.append("client_secret", `${process.env.MACHINE_CLIENT_SECRET}`)
  urlencoded.append("audience", `${process.env.SIGNUP_AUDIENCE}`)
  urlencoded.append("grant_type", "password")  
  urlencoded.append("username", email)
  urlencoded.append("password", password)
  urlencoded.append("scope", "openid profile email offline_access")
  
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: urlencoded,
    redirect: 'follow',
  }
  let tokens;
  try {
    tokens = await fetch("https://everybodyleave.auth0.com/oauth/token", requestOptions)
    const response = tokens.json()
    console.log("tokens", tokens)
    return await response
  } catch (err) {
    console.log("error logging in after signup", err)
  }

}
const listAuth0Users = () => {
  const token =  fetchApiAccessToken();
  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
  }
  fetch("https://everybodyleave.auth0.com/api/v2/users", requestOptions)
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}
module.exports = { getAuth0User, createAuth0User, createUserData, loginAfterSignup }

