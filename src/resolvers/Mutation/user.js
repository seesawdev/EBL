const { fromString } = require("uuidv4");
const { combineResolvers } = require("graphql-resolvers");
const { getUserId } = require("../../utils");
const { isFriend } = require("../authResolvers");


const user = {
  async setUserStatus(parent, { id, input }, context, info) {
    const userId = getUserId(context);
    return await context.prisma.updateUser(
      {
        where: { id: userId },
        data: { status: input }
      },
      info
    );
  },

  addUserToFriendlist: combineResolvers(
    isFriend,
    async (parent, { username }, context, info) => {
      const userId = getUserId(context);
      const currentUsername = await context.prisma
        .user({ id: userId })
        .username();
      const addFriends = [
        {
          user1: await context.prisma.updateUser({
            where: { username: currentUsername },
            data: {
              friends: { connect: [{ eblID: fromString(username) }] }
            }
          }),
          user2: await context.prisma.updateUser({
            where: { username: username },
            data: {
              friends: { connect: [{ eblID: fromString(currentUsername) }] }
            }
          })
        }
      ];
      const user1 = addFriends[0].user1;
      const user2 = addFriends[0].user2;
      return `${user1.username} and ${user2.username} are now friends`;
    }
  ),

  async removeUserFromFriendlist(parent, args, context, info) {
    const userId = getUserId(context);
    const currentUsername = await context.prisma
      .user({ id: userId })
      .username();
    const removeFriends = [
      {
        user1: await context.prisma.updateUser({
          where: { username: args.username1 },
          data: {
            friends: { disconnect: [{ eblID: fromString(args.username2) }] }
          }
        }),
        user2: await context.prisma.updateUser({
          where: { username: args.username2 },
          data: {
            friends: { disconnect: [{ eblID: fromString(args.username1) }] }
          }
        })
      }
    ];
    const user1 = removeFriends[0].user1;
    const user2 = removeFriends[0].user2;
    return `${user1.username} and ${user2.username} are no longer friends`;
  },

  //adds user to current users following list
  async followUser(parent, args, context, info) {
    const userId = getUserId(context);
    const follow = await context.prisma.updateUser({
      where: { id: userId },
      data: { following: { connect: [{ username: args.username }] } }
    });
    return follow;
  }
};
module.exports = { user };