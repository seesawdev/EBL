const  { config }  = require("./discourseConfig");
async function syncSsoData() {
  const requestOptions = {
    method: 'POST',
  }
  try {
    console.log("syncing sso data")
    await fetch(`http://discourse.everybodyleave.com/admin/users/sync_sso?api_username=${config.DISCOURSE_API_USERNAME}&api_key=${config.DISCOURSE_API_KEY}`, requestOptions)
  } catch (err) {
    console.log("error syncing sso data")
  }
}
async function getDiscourseId(auth0Id) {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  }
  try {
    const getDiscourseUser = await fetch(`http://discourse.everybodyleave.com/users/by-external/${auth0Id}.json?api_username=${config.DISCOURSE_API_USERNAME}&api_key=${config.DISCOURSE_API_KEY}`, requestOptions);
    const response = await getDiscourseUser.json();
    console.log("discourse data", response)
    const discourseId = await response.user.id;
    console.log("discourseId", discourseId);
    return discourseId;
    } catch (err) {
      console.log("There was an error fetching discourse user. User either does not exist or has not logged into the service yet.", err);
    };
};

async function logOutDiscourseUser(auth0Id) {
  const discourseUserId = await getDiscourseId(auth0Id);
  const requestOptions = {
    method: 'POST'
  }
  if(!discourseUserId) {
    console.log("User does not exist or is not logged into Discourse")
  }
  try {
    const logoutFromDiscourse = fetch(
      `http://discourse.everybodyleave.com/admin/users/${discourseUserId}/log_out?api_username=${config.DISCOURSE_API_USERNAME}&api_key=${config.DISCOURSE_API_KEY}`, 
      requestOptions
     );
    const response = await logoutFromDiscourse;
    console.log("user is now logged out of discourse");
    return await response;
  } catch (err) {
    console.log("Unable to log user out of discourse", err);
  };
};

module.exports = { getDiscourseId, logOutDiscourseUser, syncSsoData };