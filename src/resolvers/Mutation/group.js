const { getUserId } = require('../../utils')
const { fromString } = require("uuidv4");
const { isAuthenticated } = require('../authResolvers')
const { combineResolvers } = require("graphql-resolvers");

const group = {
  joinGroup: combineResolvers(
   isAuthenticated,
    async (parent, args, context) =>{
      const userId = await getUserId(context)
      const groupExists = await context.prisma.$exists.group({name: args.name})
      if (!groupExists) {
        let newGroup;
        try {
          newGroup = await context.prisma.createGroup({ name: args.name, groupId: fromString(args.name) })
          await context.prisma.updateGroup({
            where: { name: args.name },
            data: {
              update: { users: { ...userId } }
            }
          })
        } catch (err) {
          console.log("Could not add user to group", err)
        }
        return newGroup
      }
    })
}
module.exports = { group }