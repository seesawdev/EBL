const Post = {
  author: ({ id }, args, context) => {
    return context.prisma.post({ id }).author()
  },
  title: ({ id }, args, context) => {
    return context.prisma.post({ id }).title()
  },
  info: ({ id }, args, context) => {
    return context.prisma.post({ id }).info()
  },
  content: ({ id }, args, context) => {
    return context.prisma.post({ id }).content()
  }
}

module.exports = {
  Post,
}
