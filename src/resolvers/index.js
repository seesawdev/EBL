const { Query } = require('./Query')
const { auth } = require('./Mutation/auth')
const { Goal } = require('./Goal')
const { goal } = require('./Mutation/goal')
const { post } = require('./Mutation/post')
const { Subscription } = require('./Subscription')
const { User } = require('./User')
const { user } = require("./Mutation/user");
const { Post } = require('./Post')

module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...post,
    ...user,
    ...goal,
  },
  Subscription,
  User,
  Post,
  Goal,
}
