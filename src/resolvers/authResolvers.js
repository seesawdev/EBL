const { skip } = require("graphql-resolvers");
const { fromString } = require("uuidv4");
const { getUserId } = require("../utils");


function isAuthenticated(parent, args, context) {
  const userId = getUserId(context);
  userId ? skip : new Error("Not authenticated as user.");
}

async function isOwner(parent, { id }, { prisma, me }) {
  const movie = await prisma.post({ id }).postedBy();
  // console.log(movie.id, me)
  if (post.id !== me) {
    throw new Error("Not authenticated as owner");
  }
  skip;
}
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
