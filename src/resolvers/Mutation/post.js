const { getUserId } = require('../../utils')

const post = {
  async createDraft(parent, { title, info }, context) {
    const userId = getUserId(context)
    return context.prisma.createPost({
      title,
      info,
      author: { connect: { id: userId } },
    })
  },

  async publish(parent, { id }, context) {
    const userId = getUserId(context)
    const postExists = await context.prisma.$exists.post({
      id,
      author: { id: userId },
    })
    if (!postExists) {
      throw new Error(`Post not found or you're not the author`)
    }

    return context.prisma.updatePost(
      {
        where: { id },
        data: { published: true },
      },
    ) 
  },
  async postWithoutDraft(parent, args, context, info) {
    const  userId  = getUserId(context)
    return await context.prisma.createPost({
        
          title: args.title,
          info: args.info,
          content: args.content,
          published: true,
          author: { 
            connect: { id: userId } 
        
      }
    })
  },
  async deletePost(parent, { id }, context) {
    const userId = getUserId(context)
    const postExists = await context.prisma.$exists.post({
      id,
      author: { id: userId },
    })
    if (!postExists) {
      throw new Error(`Post not found or you're not the author`)
    }

    return context.prisma.deletePost({ id })
  },
}

module.exports = { post }
