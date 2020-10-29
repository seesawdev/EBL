const { Query } = require('./Query')
const { auth } = require('./Mutation/auth')
const { Goal } = require('./Goal')
const { goal } = require('./Mutation/goal')
const { post } = require('./Mutation/post')
const { Subscription } = require('./Subscription')
const { User } = require('./User')
const { user } = require("./Mutation/user");
const { Post } = require('./Post')
const { Group } = require('./Group')
const { group } = require('./Mutation/group')
module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...post,
    ...user,
    ...goal,
    ...group
  },
  Subscription,
  User,
  Post,
  Goal,
  Group
}
