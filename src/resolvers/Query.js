const { combineResolvers } = require("graphql-resolvers");
const { getUserId } = require("../utils");
const { isFriend, isAuthenticated, isOwner } = require("./authResolvers");

const Query = {
async status(parent, args, context, info) {
  const userId = await getUserId(context)
  const where = args.filter
  ? {
    OR: [
      { nickname_contains: args.filter },
      { name_contains: args.filter }
    ]
  } 
  : { id: userId }
  const user = context.prisma.user({ where })
  return await user
},
async feed(parent, args, context, info) {
    const where = args.filter
      ? {
          OR: [
            { title_contains: args.filter },
            { author: { nickname_contains: args.filter } },
            { content_contains: args.filter }
          ],
          AND: [{ published: true }]
        }
      : { published: true };
    return await context.prisma.posts({ where }, info) || {};
  },
async drafts(parent, args, context) {
    const id = await getUserId(context);
    const where = {
      published: false,
      author: {
        id
      }
    };
    return context.prisma.posts({ where });
  },
  async post(parent, { id }, context) {
    
    return await context.prisma.post({ id });
  },
  //queries goals that belong to current user
  async goals(parent, args, context, info) {
    const id = await getUserId(context);
    const where = {
      published: true,
      author: { id }
    };
    const userGoals = await context.prisma.goals({ where }, info);
    return userGoals;
  },

  //queries goals that belong to a certain user
  async goalsByUser(parent, args, context, info) {
    const id = args.id;
    const where = {
      published: true,
      author: { id }
    };
    return await context.prisma.goals({ where }, info);
  },

  //returns current user's total number of goals
  async getGoalCount(parent, args, context, info) {
    const userId = await getUserId(context);
    const goalTotal = await context.prisma
      .goalsConnection(
        {
          where: { author: { id: args.id } }
        },
        info
      )
      .aggregate()
      .count();
    return await goalTotal;
  },
  async me(parent, args, context) {
    const id = await getUserId(context);
    return await context.prisma.user({ id });
  },

  // returns total number of friend for current user
  async friendCount(parent, args, context, info) {
    const currentUserId = await getUserId(context);
    const userID = context.prisma.user({ id: currentUserId }).eblID;
    const friendsOfCurrentUser = await context.prisma
      .usersConnection(
        {
          where: {
            id_not: currentUserId,
            friends_some: { eblID_in: userID }
          }
        },
        info
      )
      .aggregate()
      .count();
    return await friendsOfCurrentUser;
  },


  async getUserStatus(parent, { status }, context, info) {
    const userStatus = await context.prisma.users(
      {
        where: {
          status: status,
          profileStatus: "PUBLIC"
        }
      },
      info
    );
    return await userStatus;
  },
  //returns total number of followers the currentUser has
  async followers(parent, args, context, info) {
    const userId = getUserId(context)
    const followersCount = context.prisma.usersConnection({
      where: {
        id_not: userId,
        following_every: { id_in: userId }
      }
    })
      .aggregate()
      .count()
    return followersCount
  },
  //retrieve a list of a user's friends
  async userFriends(parent, { nickname }, context, info) {
    const userId = fromString(nickname);
    const userFriends = await context.prisma.user({ eblID: userId }).friends();
    //  console.log(userFriends)
    return userFriends;
  },
  async friendExists(parent, args, context, info) {
    const userId = getUserId(context);
    const isUserInFriendList = await context.prisma
      .usersConnection(
        {
          where: {
            AND: [
              { id: userId },
              { friends_some: { eblID_in: fromString(args.nickname) } }
            ]
          }
        },
        info
      )
      .aggregate()
      .count();
    // console.log(userId, isUserInFriendList, info)
    return isUserInFriendList !== 0 ? true : false;
  },
 
 
  async bulletinPostHistory(parent, args, context, info){
    const userId  = await getUserId(context);
    console.log("getting post history from userId: ", userId)
    const postsHistory = await context.prisma.user({ id: userId }).posts()
      return postsHistory;
    }
}
module.exports = { Query }
