const Group = {
  users: ({ id }, args, context) => {
    return context.prisma.group({ id }).users();
  },
  name: ({ id }, args, context) => {
    return context.prisma.group({ id }).name();
  },
}
module.exports = { Group }