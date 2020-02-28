const { getUserId } = require('../utils')

const Query = {
  feed(parent, args, context, info) {
    const where = args.filter
      ? {
          OR: [
            { title_contains: args.filter },
            { postedBy: { username_contains: args.filter } },
            { info_contains: args.filter }
          ],
          AND: [{ published: true }]
        }
      : { published: true };
    return context.prisma.posts({ where }, info);
  },
  drafts(parent, args, context) {
    const id = getUserId(context);
    const where = {
      published: false,
      author: {
        id
      }
    };
    return context.prisma.posts({ where });
  },
  post(parent, { id }, context) {
    return context.prisma.post({ id });
  },
  me(parent, args, context) {
    const id = getUserId(context);
    return context.prisma.user({ id });
  },

  // returns total number of friend for current user
  async friendCount(parent, args, context, info) {
    const currentUserId = await getUserId(context);
    const userID = context.prisma.user({ id: currentUserId }).userId;
    const friendsOfCurrentUser = await context.prisma
      .usersConnection(
        {
          where: {
            id_not: currentUserId,
            friends_some: { userId_in: userID }
          }
        },
        info
      )
      .aggregate()
      .count();
    return friendsOfCurrentUser;
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

  //retrieve a list of a user's friends
  async userFriends(parent, { username }, context, info) {
    const userId = fromString(username);
    const userFriends = await context.prisma.user({ userId: userId }).friends();
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
              { friends_some: { userId_in: fromString(args.username) } }
            ]
          }
        },
        info
      )
      .aggregate()
      .count();
    // console.log(userId, isUserInFriendList, info)
    return isUserInFriendList !== 0 ? true : false;
  }
};

module.exports = { Query }
