const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { fromString } = require("uuidv4");
const { getDiscourseId, logOutDiscourseUser } = require('../../helpers/discourse')
const { verifyToken, getAuth0UserInfo, getAuth0UserEmail} = require("../../helpers/auth0Authentication")
const { fetchApiAccessToken, getUserInfo, multipleRequests, createAuth0User } = require('../../helpers/managementClient')
const validateAndParseToken = require("../../helpers/validateAndParseIdToken");
const { getAuth0User } = require('../../helpers/practicefile')
async function createPrismaUser(context, decodedToken) {
  let data;
  data = {
    auth0Id: decodedToken.sub.split(`|`)[1],
    identity: decodedToken.sub.split(`|`)[0],
    nickname: decodedToken.nickname,
    avatar: decodedToken.picture,
    name: decodedToken.name,
    email: decodedToken.email,
    eblID: fromString(decodedToken.sub.split(`|`)[1]),
  };
  console.log(data)
  const user = await context.prisma.createUser({ ...data   
  });
  // const updateUser = await context.prisma.updateUser({
  //   where: { id: user.id },
  //   data: { eblID: fromString(user.auth0id) }
  // });
  console.log('prisma user created successfully')
  return {
    // updateUser,
    user
  }
}
const auth = {
  // async signup(parent, args, context) {
  //   const password = await bcrypt.hash(args.password, 10);
  //   const formData = await context.prisma.createFormData({
  //       username: args.username,
  //       name: args.name
  //     });
      
  //   const user = await context.prisma.createUser({ ...formData, password });
  //   const updateUser = await context.prisma.updateUser({
  //     where: { id: user.id },
  //     data: { eblID: fromString(user.formData.username)  }
  //   });
  //   return {
  //     token: jwt.sign({ userId: user.id }, `${process.env.APP_SECRET}`),
  //     user,
  //     updateUser
  //   };
  // },

  async login(parent, { token }, context) {
    // const user = await context.prisma.user({ eblID });
    // const setUserPresence = await context.prisma.updateUser({
    //   where: { id: user.id },
    //   data: {
    //     status: "ONLINE"
    //   }
    // });

    // if (!user) {
    //   throw new Error(`No user found for : ${email}`);
    // }
    // const passwordValid = await bcrypt.compare(password, user.password);
    // if (!passwordValid) {
    //   throw new Error("Invalid password");
    // }
    // return {
    //   token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    //   setUserPresence,
    //   user
    // };
    let decodedToken = null;
    let userInfo;
    try {
      decodedToken = await verifyToken(token)
      //namespace attribute for login count.  
     
     
    } catch (err) {
      throw new Error(err.message);
    }
    const auth0Id = await decodedToken.sub.split("|")[1];
    let auth0User =  await getAuth0User(token)
    let user = await context.prisma.user({ auth0Id } , info);
    const setUserPresence = await context.prisma.updateUser({
       where: { id: user.id },
       data: {
         status: "ONLINE",
       },
     });
    
    //user does not exist in prisma database
    if (!user) {
      console.log('user not found')
    
    } 
    //check if prisma user's auth0Id matches the one from decoded token / auth0 database
    if (user && auth0User.sub.includes(auth0Id)) {
      console.log("verified user in auth0 database.", auth0User.sub)
      // return await setUserPresence
    }
    /**
    cookie

    context.request.session.userId = user.id
     */
    console.log(user)
    return await {
      token: jwt.sign({ userId: user.id, eblId: user.eblID, exp: decodedToken.exp }, `${process.env.APP_SECRET}`),
      setUserPresence,
      user,
    }
  },
  
/**
 * 
 * verifies that the auth0Id from decoded token exists in auth0 database 
 */
// async checkId(parent, { idToken }, context, info) {

// },
/**
logs in a user using Auth0 access token.  If user doesn't exist, create new prisma user
and return a jwt token o

 */
  //signup
  async authenticate(parent, { token, id_token }, context, info) {
    let user;
    let decodedToken;
    let userInfo;
    let logins;
    decodedToken = await verifyToken(token)

    try {
      const auth0Id = await decodedToken.sub.split("|")[1];
      user = await context.prisma.user({ auth0Id }, info);
     
      // const auth0Id = await decodedToken.sub.split("|")[1];
      //namespace attribute for login count.  
      logins = decodedToken["https://everybodyleave.com/additional_profile_info"].logins;
      if (!user) {
        console.log('user does not exist')
        // const decodedIdToken = await verifyToken(id_token)
        user = await createPrismaUser(context, decodedToken);
      } 
      console.log('token validated', decodedToken, logins)

    //  if ( logins <= 1) {
      
    //    console.log(auth0User)
    //   // user = await context.prisma.updateUser({ ...auth0User })
    //  }
    } catch (err) {
      throw new Error(err.message);
    }
    // const auth0Id = await decodedToken.sub.split("|")[1];
    // let auth0User =  await getAuth0User(token)
    // let user = await context.prisma.user({ auth0Id } , info);
    const setUserPresence = await context.prisma.updateUser({
       where: { id: user.id },
       data: {
         status: "ONLINE",
       },
     });
    //user does not exist in prisma database
    
    // let auth0User = await getAuth0User(token)
    let auth0User = await getAuth0User(token)
    const auth0Id = await decodedToken.sub.split("|")[1];
    // const discourseId = await getDiscourseId(auth0Id);
    // const discourseLogOut = await logOutDiscourseUser(auth0Id)
    // console.log(discourseLogOut)
    user = await context.prisma.user({ auth0Id }, info)
    //check if prisma user's auth0Id matches the one from decoded token / auth0 database
    // if (user && auth0User.sub.includes(auth0Id)) {
    //   console.log("verified user in auth0 database.", auth0User.sub)
    //   return await setUserPresence
      
    // }
    /**
    cookie
*/
    context.request.session.userId = user.id
     
    console.log(user)
    return await {
      // token: jwt.sign({ userId: user.id, eblId: user.eblID, exp: decodedToken.exp }, `${process.env.APP_SECRET}`),
      setUserPresence,
      user,
    }
  }
};

module.exports = { auth }
