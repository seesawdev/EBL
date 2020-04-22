const ManagementClient = require('auth0').ManagementClient;

const management = new ManagementClient({
  domain: `${process.env.AUTH0_DOMAIN}`,
  clientId: `${process.env.AUTH0_CLIENT_ID}`,
  clientSecret: `${process.env.AUTH0_CLIENT_SECRET}`,
  scope: `${process.env.AUTH0_MANAGEMENT_API_SCOPES}`
})

const updateUserMetadata = async (params, metadata, function(err, user)) => {
  try {
        /*
          params = { id: AUTH0_USER_ID }
          metadata = { 
           foo: barr
          }
        */
    await management.users.updateUserMetadata(params, metadata)

  } catch(err) {
    console.log("Error updating user metadata." err)
  }
  console.log("Successfully updated user metadata." user)
  return user;
}

module.exports = { updateUserMetadata }