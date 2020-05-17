const { combineResolvers } = require("graphql-resolvers");
const { getUserId } = require("../../utils");
const { isAuthenticated, isOwner } = require("../authResolvers");

const goal = {
//publishes a movie without creating a draft first
postGoal: combineResolvers(
  isAuthenticated,
  async (parent, args, context, info) => {
    const userId = getUserId(context);
    const newGoal = await context.prisma.createGoal({
      title: args.title,
      description: args.description,
      // published: true,
      author: { connect: { id: userId } }
    },
      info
    )
    return await newGoal
  }
 ),
}
module.exports = { goal } 