const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { fromString } = require("uuidv4");
const { getDiscourseId, logOutDiscourseUser } = require('../../helpers/discourse')
const { verifyToken, getAuth0UserInfo, getAuth0UserEmail} = require("../../helpers/auth0Authentication")
const { fetchApiAccessToken, getUser, getUserInfo, multipleRequests } = require('../../helpers/managementClient')
const validateAndParseToken = require("../../helpers/validateAndParseIdToken");
const { getAuth0User,  createAuth0User, createUserData} = require('../../helpers/practicefile')
async function createPrismaUser(context, auth0User) {
  let data;
  const discourseId = await getDiscourseId(auth0User.sub.split(`|`)[1]);
  data = {
    auth0Id: auth0User.sub.split(`|`)[1],
    identity: auth0User.sub.split(`|`)[0],
    nickname: auth0User.nickname,
    avatar: auth0User.picture,
    name: auth0User.name,
    email: auth0User.email,
    eblID: fromString(auth0User.sub.split(`|`)[1]),
    discourseId: discourseId,
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
  async signup(parent, args, context) {
    const password = await bcrypt.hash(args.password, 10);
    // const formData = await context.prisma.createFormData({
    //     username: args.username,
    //     name: args.name
    //   });
    const userData = await createUserData(args)
    console.log(userData) 
    const auth0User = await createAuth0User(userData)
    console.log(auth0User)
    const user = await context.prisma.createUser({ ...userData, password });
    // const updateUser = await context.prisma.updateUser({
    //   where: { id: user.id },
    //   data: { eblID: fromString(user.formData.username)  }
    // });
    
    return {
      token: jwt.sign(
        { userId: user.id, exp: decodedToken.exp },
        `${process.env.APP_SECRET}`
      ),
      user,
      // updateUser
    };
  },

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
    let user = await context.prisma.user({where:{ auth0Id } }, info);
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
    if (user && auth0User.sub.includes(auth0ID)) {
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
  

  //authenticate with Auth0 accessToken, create user if user doesn't exist, try to retrieve discourseId if that exists, set user presence, return jwt
  async authenticate(parent, { access_token, id_token }, context, info) {
    let decodedToken = null;
    let auth0User = null;
    let discourseID = null
    // let decodedIdToken = null;
    try {
      decodedToken = await verifyToken(access_token);
      auth0User = await getAuth0User(access_token)
    } catch (err) {
      throw new Error(err.message)
    }
    // const auth0Id = decodedToken.sub.split("|")[1];
    const auth0Id = auth0User.sub.split("|")[1];
    let logins = decodedToken["https://everybodyleave.com/additional_profile_info"].logins;
    let user = await context.prisma.user({ auth0Id })
    console.log(logins)
    // let auth0User = await getAuth0User(access_token);
    console.log("auth0User", auth0Id);

    if(!user) {
      user = await createPrismaUser(context, auth0User)
    }
    //check if user has logged in, try to update discourseId 
    const discourseUserId = await context.prisma.user({ auth0Id }).discourseId();
    if(logins > 1 && discourseUserId === null) {
      try {
        discourseID = await getDiscourseId(auth0Id)
        console.log("updating discourseId...")
        await context.prisma.updateUser({ where: { auth0Id }, data: { update: { discourseId: discourseID }} })
      } catch(err) {
        console.log("no discourseId found", err)
      }
    }
    
    const setUserPresence = await context.prisma.updateUser({
       where: { auth0Id },
       data: {
         status: "ONLINE",
       },
     });
   
    // const discourseLogOut = await logOutDiscourseUser(auth0Id)
   
    /**
    cookie

    context.request.session.userId = user.id
     */
    console.log(user)
    return await {
      token: jwt.sign({ userId: user.id, exp: decodedToken.exp }, `${process.env.APP_SECRET}`),
      setUserPresence,
      user,
    }
  }
};

module.exports = { auth }
