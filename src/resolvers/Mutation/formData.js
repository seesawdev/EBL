const { combineResolvers } = require("graphql-resolvers");
const { getUserId } = require("../../utils");
const { isAuthenticated, isOwner } = require("../authResolvers");

const formData = {
//publishes a movie without creating a draft first
saveFormData: combineResolvers(
  isAuthenticated,
  async (parent, args, context, info) => {
    const userId = getUserId(context);
    const newFormData = await context.prisma.createFormData({
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