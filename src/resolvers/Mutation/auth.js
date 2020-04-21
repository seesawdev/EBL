const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { fromString } = require("uuidv4");
const validateAndParseToken = require("../../helpers/validateAndParseIdToken");


async function createPrismaUser(context, idToken) {
  let data;
  data = {
    auth0id: idToken.sub.split(`|`)[1],
    identity: idToken.sub.split(`|`)[0],
    nickname: idToken.nickname,
    avatar: idToken.picture,
    name: idToken.name,
    email: idToken.email,
    eblID: fromString(idToken.sub.split(`|`)[1])
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

  async login(parent, { email, password, eblID }, context) {
    const user = await context.prisma.user({ eblID });
    const setUserPresence = await context.prisma.updateUser({
      where: { id: user.id },
      data: {
        status: "ONLINE"
      }
    });

    if (!user) {
      throw new Error(`No user found for : ${email}`);
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new Error("Invalid password");
    }
    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      setUserPresence,
      user
    };
  },
  async authenticate(parent, { idToken }, context, info) {
    let userToken = null;
    
    try {
      userToken = await validateAndParseToken(idToken)
      console.log('token validated')
    } catch (err) {
      throw new Error(err.message);
    }
    const auth0id = userToken.sub.split("|")[1];
    let user = await context.prisma.user({ auth0id } , info);
    if (!user) {
      console.log('user does not exist')
      user = await createPrismaUser(context, userToken);
    }
    console.log(user)
    return await {
      token: jwt.sign({ userId: user.id }, `${process.env.APP_SECRET}`),
      user
    }
  }
};

module.exports = { auth }
