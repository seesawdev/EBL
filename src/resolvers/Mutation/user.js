const { fromString } = require("uuidv4");
const { combineResolvers } = require("graphql-resolvers");
const { getUserId } = require("../../utils");
const { isFriend, isAuthenticated } = require("../authResolvers");
const { updateUserMetadata } = require("../../helpers/managementClient");

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
    async (parent, { nickname, auth0Id }, context, info) => {
      const userId = getUserId(context);
      const currentNickname = await context.prisma
        .user({ id: userId })
        .nickname();
      const addFriends = [
        {
          user1: await context.prisma.updateUser({
            where: { nickname: currentNickname },
            data: {
              friends: { connect: [{ eblID: fromString(auth0Id) }] }
            }
          }),
          user2: await context.prisma.updateUser({
            where: { nickname: nickname },
            data: {
              friends: { connect: [{ eblID: fromString(currentNickname) }] }
            }
          })
        }
      ];
      const user1 = addFriends[0].user1;
      const user2 = addFriends[0].user2;
      return `${user1.nickname} and ${user2.nickname} are now friends`;
    }
  ),

  async removeUserFromFriendlist(parent, args, context, info) {
    const userId = getUserId(context);
    const currentNickname = await context.prisma
      .user({ id: userId })
      .nickname();
    const removeFriends = [
      {
        user1: await context.prisma.updateUser({
          where: { nickname: args.nickname1 },
          data: {
            friends: { disconnect: [{ eblID: fromString(args.nickname2) }] }
          }
        }),
        user2: await context.prisma.updateUser({
          where: { nickname: args.nickname2 },
          data: {
            friends: { disconnect: [{ eblID: fromString(args.nickname1) }] }
          }
        })
      }
    ];
    const user1 = removeFriends[0].user1;
    const user2 = removeFriends[0].user2;
    return `${user1.nickname} and ${user2.nickname} are no longer friends`;
  },

  //adds user to current users following list
  async followUser(parent, args, context, info) {
    const userId = getUserId(context);
    const follow = await context.prisma.updateUser({
      where: { id: userId },
      data: { following: { connect: [{ nickname: args.nickname }] } }
    });
    return follow;
  },

 async updateUserProfile(parent, { formdata }, context, info){
   const userId = getUserId(context)
   const userAuth0Id = await context.prisma.user({ id: userId }).auth0Id();
   const update = context.prisma.updateUser({
     where: { auth0Id: userAuth0Id },
     data: { ...formdata }
   })
  return update
 }
};
module.exports = { user };