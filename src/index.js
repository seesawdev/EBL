const { GraphQLServer } = require('graphql-yoga')
const cors = require('cors');
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
// var jwksClient = require("jwks-rsa");
const { checkJwt } = require('./middleware/jwt')
const { getUser } = require('./middleware/getUser');
const { makeExecutableSchema } = require("graphql-tools")
const { importSchema } = require("graphql-import");
const { validateAndParseIdToken } = require('./helpers/validateAndParseIdToken')
const resolvers = require('./resolvers')
const { prisma } = require("./prisma/generated/prisma-client");
const { authDirectiveResolvers } = require('./directives')
// const endpoint = `${process.env.PRISMA_ENDPOINT}`
const endpoint = `http://localhost:5000`;


const options = {
  port: 5000,
};
const getMe = async context => {
  const Authorization = context.request.get["Authorization"];
  if (Authorization) {
    try {
      const token = Authorization.replace("Bearer ", "");
      const { userId } = await jwt.verify(token, `${process.env.APP_SECRET}`);
      return userId;
    } catch (error) {
      console.log(error);
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs: importSchema("./src/schema.graphql"),
  resolvers,
  authDirectiveResolvers,
});
const server = new GraphQLServer({
  schema,
  debug: true,
  secret: `${process.env.PRISMA_SECRET}`,
  
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
server.express.use(morgan("dev"))
server.express.use(cors({ origin: "http://localhost:3000" }));
server.express.post(endpoint, checkJwt, (req, res) => {
  res.send({
    msg: "Your Access Token was successfully validated!"
  });
})

server.start(options,  ({ port }) => console.log(`Server is running on http://localhost:${port}`));
