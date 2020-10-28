const Post = {
  author: ({ id }, args, context) => {
    return context.prisma.post({ id }).author()
  },
  title: ({ id }, args, context) => {
    return context.prisma.post({ id }).title()
  },
  description: ({ id }, args, context) => {
    return context.prisma.post({ id }).description()
  },
  content: ({ id }, args, context) => {
    return context.prisma.post({ id }).content()
  }
}

module.exports = {
  Post,
}
