const FormData = {
  email: ({ id }, args, context, info) => {
    return context.prisma.formData({ id }).email()
  },
  name: ({ id }, args, context, info) => {
    return context.prisma.formData({ id }).name()
  },
  username: ({ id }, args, context, info) => {
    return context.prisma.formData({ id }).username()
  },

}

module.exports = { FormData }