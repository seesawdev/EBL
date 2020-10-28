const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { fromString } = require("uuidv4");
const { getDiscourseId, logOutDiscourseUser, syncSsoData } = require('../../helpers/discourse')
const { verifyToken, getAuth0UserInfo, getAuth0UserEmail} = require("../../helpers/auth0Authentication")
const { fetchApiAccessToken, getUser, getUserInfo, multipleRequests } = require('../../helpers/managementClient')
const validateAndParseToken = require("../../helpers/validateAndParseToken");
const { getAuth0User,  createAuth0User, createUserData, loginAfterSignup, updateUserMetadata} = require('../../helpers/practicefile')
const { config } = require('../../helpers/auth0Config')
const { getUserId } = require('../../utils')

async function createUserFromFormData(context, data) { 
  const hashedPassword = await bcrypt.hash(data.password, 10);
  // const { username, email, password, leavingFrom, leavingTo } = data
  
  const userFormData = { 
    name: data.username, 
    email: data.email, 
    password: hashedPassword,
    leavingFrom: data.leavingFrom,
    leavingTo: data.leavingTo
    };

    let user = await context.prisma.createUser({
      ...userFormData,
    })
    const metadata = {
      leavingFrom: data.leavingFrom,
      leavingTo: data.leavingFrom,
      userId: user.id
  }
    const auth0Data = {
      email: data.email,
      password: data.password,
      name: data.username,
      metaData: {...metadata} || {} 
    }
  
    
    // let userData = await createUserData(userId, auth0Data)
    console.log("sending user data to Auth0", auth0Data) 
    let auth0User = await createAuth0User(auth0Data)
    // console.log("auth0User response object", auth0User.name)
    let auth0Identities = Object.values(auth0User['identities'])[0];
    let auth0ID = auth0Identities['user_id']
    // console.log("auth0ID", auth0ID)
    let authTokens = await loginAfterSignup(auth0User.email, data.password);
    // console.log(authTokens)
    const jwtExpirySeconds = 900

    const refreshToken = authTokens.refresh_token;
    console.log("refresh token: ", refreshToken)
    context.res.cookie("refresh_token", refreshToken, {
      path: '/',
      // signed: true, 
      httpOnly: true,
      // secure: false, 
      // sameSite: 'lax',
      // expiresIn: authTokens.expires_in,
      maxAge: jwtExpirySeconds * 2592000 //30 days
    });

    const prismaToken = jwt.sign({ userId: user.id }, `${process.env.APP_SECRET}`, {expiresIn: authTokens.expires_in})
    context.res.cookie("authorization", prismaToken, { 
          signed: false, 
          path: '/',
          httpOnly: true,
          // secure: false, 
          domain: 'http:/localhost:3000',
          // sameSite: 'lax',
          // expiresIn: authTokens.expires_in
          maxAge: jwtExpirySeconds * 1000 //15 min
        })
  const cookieOptions = {
    //  signed: true,
    path: '/',
    httpOnly: true,
    domain: 'http:/localhost:3000',
    maxAge: jwtExpirySeconds * 2592000
  }
  context.res.cookie( 
    // "refresh_token", refreshToken, { cookieOptions }, 
    // "authorization", prismaToken, { cookieOptions },
    "onboarded", true, { cookieOptions }
    )
    const updateUserAfterAuth0 = await context.prisma.updateUser({
      where: { id: user.id },
      data:  { 
        // created_at: auth0User.created_at,
        nickname: auth0User.nickname,
        avatar: auth0User.picture,
        // updated_at: auth0User.updated_at,
        auth0Id: auth0User.user_id.split("|")[1],
        // metaData: auth0User.user_metadata,
        eblID: fromString(auth0User.user_id.split("|")[1]),
        status: "ONLINE" 
        }
    })
    return await {
    token: prismaToken,
        updateUserAfterAuth0,
        // refreshCookie,
        user,
    }
  }
async function createPrismaUser(context, decodedToken) {
  
  let data = {
    auth0Id: decodedToken.sub.split("|")[1],
    identity: "auth0",
    // nickname: auth0User.nickname ? auth0User.nickname : null,
    // avatar: decodedToken.picture ? decodedToken.picture : null,
    // name: decodedToken.name,
    // email: decodedToken.email,
    eblID: fromString(decodedToken.sub.split(`|`)[1]),
    discourseId: await getDiscourseId(decodedToken.sub.split("|")[1]) || null,
    metaData: decodedToken.user_metadata || null,
  };
  console.log("created user with data:", data)
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
const encode = (args, secret, options) => {
  return jwt.sign(args, secret, options);
};
const generateRefreshCookie = (args, context) => {
  const refreshToken = encode(args, `${process.env.APP_SECRET}`, { expiresIn: "30d" });
  const cookieToken = context.response.cookie("refreshtoken", refreshToken, {
    expiresIn: "30d",
    httpOnly: true,
    secure: false,
  });
  return cookieToken;
};
const auth = {
  async signup(parent, { username, password, email, leavingTo, leavingFrom, metadata, avatar } = {}, context) {
    const data = { 
      username: username, 
      password: password, 
      email: email, 
      leavingTo: leavingTo, 
      leavingFrom: leavingFrom 
      } 
    const { user, token } = await createUserFromFormData(context, data)
   
  return await {
      token,
      user,
    };
  },

  async login(parent, {email, password}, context) {
    let user;
    user  = await context.prisma.user({ email });
    // const setUserPresence = await context.prisma.updateUser({
    //   where: { id: user.id },
    //   data: {
    //     status: "ONLINE"
    //   }
    // });
   console.log(user.password)
    if (!user) {
      throw new Error(`No user found for : ${email}`);
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new Error("Invalid password");
    }
    const authTokens = await loginAfterSignup(
      email,
      password
    );
   
     const prismaToken = jwt.sign(
       { userId: user.id },
       `${process.env.APP_SECRET}`,
       { expiresIn: authTokens.expires_in }
     );
     context.res.cookie("authorization", prismaToken, {
      //  signed: true, 
       httpOnly: true,
       domain: 'http://127.0.0.1',
       path: '/',
      //  secure: false, 
      //  sameSite: 'lax',
      //  expiresIn: authTokens.expires_in,
      maxAge: 60 * 60 * 24 
     });
   
    const setUserPresence = await context.prisma.updateUser({
       where: { id: user.id },
       data: {
         status: "ONLINE",
       },
     });
    //user does not exist in prisma database
    // if (!user) {
    //   console.log('user not found')
    
    // } 
    //check if prisma user's auth0Id matches the one from decoded token / auth0 database
    // if (user && auth0User.sub.includes(auth0ID)) {
    //   console.log("verified user in auth0 database.", auth0User.sub)
    //   // return await setUserPresence
    // }
    /**
    cookie
     token: jwt.sign(
        { userId: user.id},
        `${process.env.APP_SECRET}`,
        { expiresIn: authTokens.expires_in }
      ),
    context.request.session.userId = user.id
     */
    //  const token = jwt.sign({ userId: user.id }, `${process.env.APP_SECRET}`, {
    //    expiresIn: '1d',
    //  })
    //  context.response.cookie("prismaToken", token, {
    //     expiresIn: '1d',
    //     httpOnly: true,
    //  });
    return await {
      token: prismaToken,
      setUserPresence,
      user,
    };
  },
  

  //authenticate with Auth0 accessToken, create user if user doesn't exist, try to retrieve discourseId if that exists, set user presence, return jwt
  async authenticate(parent, { access_token, id_token }, context, info) {
    let decodedToken = null;
    let auth0User = null;
    let discourseID = null
    // let decodedIdToken = null;
    try {
      decodedToken = await verifyToken(access_token);
    } catch (err) {
      throw new Error(err.message)
    }
    // const auth0Id = decodedToken.sub.split("|")[1];
    auth0User = await getAuth0User(access_token);

    let auth0Id = await decodedToken.sub.split("|")[1];
    let logins = await decodedToken["https://everybodyleave.com/claims/user_metadata"].logins;
    let userID = await decodedToken["https://everybodyleave.com/claims/user_metadata"].userId;

    let user = await context.prisma.user({ id: userID })
    console.log("UserID: ", userID)
    // let auth0User = await getAuth0User(access_token);
    console.log("auth0User", auth0Id);
    if(!user) {
      user = await createPrismaUser(context, decodedToken)
    }
    //check if user has logged in, try to update discourseId 
    let discourseUserId = await context.prisma.user({ auth0Id }).discourseId();
    if(logins >= 1) {
      try {
       
          discourseID = await getDiscourseId(auth0Id)
          console.log("attempting to update discourseId...")
          await context.prisma.updateUser({ where: { auth0Id }, data: { discourseId: discourseID } })
        
      } catch(err) {
        console.log("no discourseId found", err)
      }
    }
    // const updateMetadata = await updateUserMetadata(user.id, auth0Id, user.id)
  let setUserPresence;
try {
  setUserPresence = await context.prisma.updateUser({
       where: { id: userID },
       data: {
         status: "ONLINE",
       },
     });
} catch (err) {
  console.log("could not update user status", err)
}
   
    // const discourseLogOut = await logOutDiscourseUser(auth0Id)
   const jwtExpirySeconds = 900
    /**
    cookie
    context.request.session.userId = user.id
     */
    console.log("decodedToken.exp ", decodedToken.exp)
    const token = await jwt.sign({ userId: user.id }, `${process.env.APP_SECRET}`, { expiresIn: jwtExpirySeconds }, )

    context.res.cookie('authorization', token, { 
      signed: true, 
      path: '/',
      // domain: 'http://127.0.0.1',
      // expiresIn: decodedToken.exp,
      maxAge: jwtExpirySeconds * 1000,
      httpOnly: true,
      // secure: false, 
      // sameSite: 'false'
    })
    console.log(user)
    return await {
      token,
      user,
      setUserPresence,
      // updateMetadata
    }
  },
  async logout(parent, args, context, info) {
    const userId = await getUserId
    const setUserPresence = await context.prisma.updateUser({
       where: { id: user.id },
       data: {
         status: "OFFLINE",
       },
     });
    const auth0Id = await context.prisma.user({ id: userId }).auth0Id
    const logoutDiscourse = await logoutDiscourseUser(auth0id)
    console.log("logging out") 
    return await {
      setUserPresence,
      logoutDiscourse
    }
  }
};

module.exports = { auth }
