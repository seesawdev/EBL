const { GraphQLServer } = require('graphql-yoga')
const { makeExecutableSchema } = require("graphql-tools")
const { importSchema } = require("graphql-import");
const { validateAndParseIdToken } = require('./helpers/validateAndParseIdToken')
const resolvers = require('./resolvers')
const { prisma } = require("./prisma/generated/prisma-client");
const { directiveResolvers } = require('./directives')
const options = {
  port: 5000,
}
const getMe = async (context) => {
  const Authorization = context.request.get['Authorization']
  if (Authorization) {
    try {
      const token = Authorization.replace('Bearer ', '');
      const { userId } = await validateAndParseIdToken(token);
      return userId;
    } catch (error) {
      console.log(error);
    }
  }
}
const schema = makeExecutableSchema({
  typeDefs: importSchema('./src/schema.graphql'),
  resolvers,
  directiveResolvers
})
const server = new GraphQLServer({
  schema,
  debug: true,
  context: async request => {
    // if (request) {
    //   const me = await getMe(request);

      return {
        ...request,
        // me,
        prisma
      };
    }
  // }
});
// server.post(
//   server.options.port,
//   checkJwt,
//   (err, req, res, next) => {
//     if (err) return res.status(401).send(err.message)
//     next();
//   }
// )


server.start(options, ({ port }) => console.log(`Server is running on http://localhost:${port}`));
