const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { fromString } = require("uuidv4");


const auth = {
  async signup(parent, args, context) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await context.prisma.createUser({ ...args, password })
    const updateUser = await context.prisma.updateUser({
      where: { id: user.id },
      data: { eblID: fromString(user.username) }
    });
    return {
      token: jwt.sign({ userId: user.id }, `${process.env.APP_SECRET}`),
      user,
      updateUser
    };
  },

  async login(parent, { email, password }, context) {
    const user = await context.prisma.user({ email })
    const setUserPresence = await context.prisma.updateUser({
      where: { id: user.id },
      data: {
        status: "ONLINE"
      }
    });

    if (!user) {
      throw new Error(`No user found for email: ${email}`)
    }
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      throw new Error('Invalid password')
    }
    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      setUserPresence,
      user,
    }
  },
}

module.exports = { auth }
