const  { config }  = require("./discourseConfig");

async function getDiscourseId(auth0Id) {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  }
  try {
    const getDiscourseUser = await fetch(`http://discourse.everybodyleave.com/users/by-external/${auth0Id}.json?api_username=${config.DISCOURSE_API_USERNAME}&api_key=${config.DISCOURSE_API_KEY}`, requestOptions);
    const response = await getDiscourseUser.json();
    const discourseId = await response.user.id;
    console.log("discourseId", discourseId);
    return await discourseId;
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

module.exports = { getDiscourseId, logOutDiscourseUser };