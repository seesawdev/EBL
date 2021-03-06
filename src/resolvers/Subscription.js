const Subscription = {
  feedSubscription: {
    subscribe: async (parent, args, context) => {
      return context.prisma.$subscribe
        .post({
          mutation_in: ['CREATED', 'UPDATED'],
        })
        .node()
    },
    resolve: payload => {
      return payload
    },
  },

  userStatusSubscription: {
   subscribe: async (parent, args, context) => {
     return await context.prisma.$subscribe
      .user({
        mutation_in: ["UPDATED"],
      })
      .node()
   },
   resolve: payload => {
     return payload
   }
 }

}

module.exports = { Subscription }
