const User = {
  posts: ({ id }, args, context) => {
    return context.prisma.user({ id }).posts();
  },
  email: ({ id }, args, context) => {
    return context.prisma.user({ id }).email();
  },
  auth0Id: ({ id }, args, context) => {
    return context.prisma.user({ id }).auth0Id();
  },
  discourseId: ({ id }, args, context) => {
    return context.prisma.user({ id }).discourseId();
  },
  eblID: ({ id }, args, context) => {
    return context.prisma.user({ id }).eblID();
  },
  status: ({ id }, args, context) => {
    return context.prisma.user({ id }).status();
  },
};
module.exports = {
  User,
}