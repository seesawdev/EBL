const Goal = {
  author: ({ id }, args, context) => {
    return context.prisma.goal({ id }).author();
  }

}
module.exports = { Goal }