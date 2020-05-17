// const ManagementClient = require('auth0').ManagementClient;

// const management = new ManagementClient({
//   domain: `${process.env.AUTH0_DOMAIN}`,
//   clientId: `${process.env.AUTH0_CLIENT_ID}`,
//   clientSecret: `${process.env.AUTH0_CLIENT_SECRET}`,
//   scope: `${process.env.AUTH0_MANAGEMENT_API_SCOPES}`
// })

// const updateUserMetadata = async (params, metadata) => {
//   try {
//         /*
//           params = { id: AUTH0_USER_ID }
//           metadata = { 
//            foo: barr
//           }
//         */
//     await management.users.updateUserMetadata(params, metadata, (err, user))

//   } catch(err) {
//     console.log("Error updating user metadata.", err)
//   }
//   console.log("Successfully updated user metadata.", user)
//   return user;
// }

// module.exports = { updateUserMetadata }
const axios = require('axios')
const { getUserId } = require('../utils')
const  { config } = require('./auth0Config')

async function multipleRequests(access_token) {
  const options = {
    headers: { 'Authorization': access_token },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
  };
 axios.all([
    axios.post("https://everybodyleave.auth0.com/oauth/token",
      {
        client_id: `${config.CLIENT_ID}`,
        client_secret: `${config.CLIENT_SECRET}`,
        audience: `${config.AUDIENCE}`,
        grant_type: "client_credentials",
      }),
    axios.get("https://everybodyleave.auth0.com/userinfo", options)
  ])
  .then(axios.spread((tokenResponse, userResponse) => {
    console.log("successfully fetched apiToken ", tokenResponse.data);
    console.log("successfully fetched user profile ", userResponse.data)
   })
  )
}
async function fetchApiAccessToken() {
  try {
    const res = await axios.post(
      "https://everybodyleave.auth0.com/oauth/token",
        // "Content-type": "application/x-www-form-urlencoded" 
        // headers: headers
        {      
          client_id: `${config.CLIENT_ID}`,
          client_secret: `${config.CLIENT_SECRET}`,
          audience: `${config.AUDIENCE}`,
          grant_type: "client_credentials",
        }
      );
    const responseData = await res.data.access_token;
    console.log("api access token: ", responseData);
    return await responseData
  } catch (err) {
    console.log(await err)
    throw new Error(err);
  }
};

async function getUserInfo(access_token, id) {
  // const apiAccessToken = await fetchApiAccessToken();
  const options = {
    headers: { 'Authorization': access_token }
  };
  try {
    const userInfo = await fetch(`https://everybodyleave.auth0.com/api/v2/users/${id}`, {
      method: 'POST',
      headers: new Headers({ 
        authorization: fetchApiAccessToken()
      })
    })
    
    const response = await userInfo.json();
    console.log(response);
    return await response
  } catch(err) {
    console.log("there was an error getting userinfo with access_token", err)
  }
}
// async function getUserInfo() {
//   let apiToken;
//   try {
//     apiToken = await fetchApiAccessToken();
//   }
// }
/**
 * body must include username, email, password, user_metadata(optional)
 * 
 */
const createAuth0User = async (email, username, password, data) => { 

    const headers = {
      "Authorization": `Bearer ${process.env.AUTH0_API_TOKEN}`,
      "Content-Type": "application/json"
    }
    const body = {
      "connection": "Username-Password-Authentication",
      "email": email,
      "username": username,
      "password": password,
      "user_metadata": { data },
      "email_verified": true,
    }
     try {
       const newUser = await axios.post(
         "https://everybodyleave.auth0.com/api/v2/users",
         { headers },
         body
       );
       const response = await newUser.data;
       console.log(response);
       return await response
     } catch (err) {
            console.log("There was an error creating Auth0 user", err)
           throw new Error(err);
     }
}

const updateUserMetadata = async (parent, args, context, info) => {
  const userId = getUserId(context)
  const auth0Id = context.prisma.user({ id: userId }).auth0Id();
  const headers = {
    "Authorization": `Bearer ${process.env.AUTH0_API_TOKEN}`,
    "Content-Type": "application/x-www-form-urlencoded"
  }
  const metadata = [...args]
  try {
    const updatedMetadata = await axios.patch(`${process.env.AUTH0_AUDIENCE}/${auth0Id}`, {
      headers: headers,
      },
      metadata
    )
    const response = await updatedMetadata.data
    console.log("successfully updated metadata", response)
    return await response
  } catch(err) {
    console.log("error updating metadata", err)
    throw new Error(err);
  }
}

module.exports = { fetchApiAccessToken, updateUserMetadata, getUserInfo, multipleRequests }