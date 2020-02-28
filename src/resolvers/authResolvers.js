const { skip } = require("graphql-resolvers");
const { fromString } = require("uuidv4");
const { getUserId } = require("../utils");


//will skip if args.username is not in friend list
async function isFriend(parent, args, { prisma, me }) {
  // const userId = getUserId(context);
  const isUserInFriendList = await prisma
    .usersConnection({
      where: {
        AND: [
          { id: me },
          { friends_some: { eblID_in: fromString(args.username) } }
        ]
      }
    })
    .aggregate()
    .count();
  // const test = __type.enumValues.data
  // console.log(test)
  // console.log(userId, isUserInFriendList, info) <Select> </Select>
  return isUserInFriendList !== 0
    ? `You are already friends with ${args.username}`
    : skip;
}

module.exports = { isAuthenticated, isOwner, isFriend };
