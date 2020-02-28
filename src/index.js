const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const jwt = require("jsonwebtoken");
const resolvers = require('./resolvers')

const options = {
  port: 5000
}
const getMe = async (context) => {
  const Authorization = context.request.get['Authorization']
  if (Authorization) {
    try {
      const token = Authorization.replace('Bearer ', '');
      const { userId } = await jwt.verify(token, `${process.env.APP_SECRET}`);
      return userId;
    } catch (error) {
      console.log(error);
    }
  }
}
const server = new GraphQLServer({
  typeDefs: "src/schema.graphql",
  resolvers,
  context: async request => {
    if (request) {
      const me = await getMe(request);

      return {
        ...request,
        me,
        prisma
      };
    }
  }
});

server.start(options, ({ port }) => console.log(`Server is running on http://localhost:${port}`));
