require('dotenv').config();
const session =  require('express-session');
const { GraphQLServer } = require('graphql-yoga')
const helmet = require('helmet')
const cors = require('cors');
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const { checkJwt } = require('./middleware/jwt')
const { makeExecutableSchema } = require("graphql-tools")
const { importSchema } = require("graphql-import");
const { validateAndParseIdToken } = require('./helpers/validateAndParseIdToken')
const resolvers = require('./resolvers')
const { prisma } = require("./prisma/generated/prisma-client");
const { authDirectiveResolvers } = require('./directives')



// const endpoint = `${process..PRISMA_ENDPOINT}`
const endpoint = `http://localhost:5000`;

const port =  5000
const options = {
  port: 5000,
};
//gets the logged in user, implemented for resolver level security in authResolvers file
const getMe = async context => {
  const Authorization = context.request.get["Authorization"];
  if (Authorization) {
    try {
      const token = Authorization.replace("Bearer ", "");
      const { userId } = await jwt.verify(token, process.env.APP_SECRET);
      return userId;
    } catch (error) {
      console.log(error);
    }
  }
  // if (context.request.session.userId) {
  //   return context.request.session.userId
  // }
};

const schema = makeExecutableSchema({
  typeDefs: importSchema("./src/schema.graphql"),
  resolvers,
  authDirectiveResolvers,
});
const server = new GraphQLServer({
  schema,
  debug: true,
  secret: process.env.PRISMA_SECRET,
  
  context: async request => {
    //this will be used for resolver level security / directives
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
server.express.use(helmet());
server.express.use(
  morgan("dev")
);
/**
  this is for session cookies authentication
*/
// server.express.use(
//     session({
//       name: "qid",
//       secret: `${process.env.SESSION_SECRET}`,
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
//       }
//     })
//   );
// const cors = {
//   credentials: true,
//   origin: ["http://localhost:3000", "http://localhost:3003"],
// }
// server.start({ cors }, ({ port })  => console.log(`Server is running on http://localhost:${port}`))

 
server.express.use(cors({ origin: "http://localhost:3000" }));
server.express.post(endpoint, checkJwt, (req, res) => {
  res.send({
    msg: "Your Access Token was successfully validated!"
  });
})

server.start(options,  ({ port }) => console.log(`Server is running on http://localhost:${port}`));
