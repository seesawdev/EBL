const { getUserId } = require('../../utils')
const group = {
  async joinGroup(parent, args, context) {
    const userId = await getUserId(context)
    const groupExists = await context.prisma.$exists.group({name: args.name})
    if (!groupExists) {
      try {
        await context.prisma.createGroup({ name: args.name })
        await context.prisma.updateGroup({
          where: { name: args.name },
          data: {
            update: { users: { ...userId } }
          }
        })
      } catch (err) {
        console.log("Could not add user to group", err)
      }
    }

    return context.prisma.updatePost(
      {
        where: { id },
        data: { published: true },
      },
    ) 
  }

}
module.exports = { group }