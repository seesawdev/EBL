require('dotenv').config();
// const session =  require('express-session');
const { GraphQLServer } = require('graphql-yoga')
const { ApolloServer } = require("apollo-server-express");
const express = require('express')
const helmet = require('helmet')
const cors = require('cors');
const compression = require('compression')
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const parser = require("body-parser");
const { checkJwt } = require('./middleware/jwt')
const { getUser, getCookie } = require('./middleware/getUser')
const { makeExecutableSchema } = require("graphql-tools")
const { importSchema } = require("graphql-import");
const { validateAndParseIdToken } = require('./helpers/validateAndParseIdToken')
const resolvers = require('./resolvers')
const { prisma } = require("./prisma/generated/prisma-client");
const { authDirectiveResolvers } = require('./directives')
const { config } = require('./helpers/auth0Config')
// const { Cookies } = require("universal-cookie");
const Cookies = require('cookies') 
const http = require('http')
const port = `${process.env.PORT}` || 5000
// const endpoint = `${process..PRISMA_ENDPOINT}`
const endpoint = `http://localhost:5000/graphql`;

// const cookies = new Cookies()
const app = express()
const corsOptions = {
    port: 5000,
    origin: "http://localhost:3000",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }
app.use(cors(corsOptions))
app.use(helmet());
app.use(
  morgan("dev")
);
// app.use(cors());
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(cookieParser(process.env.APP_SECRET));
app.use(compression());
app.use((req, res, next, context) => {
  const options = { keys: ['Some random keys']};
  context.req.cookies = new Cookies(req, res, options);
  next();
})

const getMe = async (context) => {
  const Authorization = await context.req.get("Authorization")
  const tokenCookie = await context.req.signedCookies.authorization
  // console.log("signed cookies: ", context.req.signedCookies.authorization)
  // console.log("cookies", context.req.cookies)
  if (Authorization) {
      try {
        const token = Authorization.replace('Bearer ', '')
        const { userId } =  await jwt.verify(token, process.env.APP_SECRET);
        return userId;
      } catch (error) {
        console.log(error);
      }
      } else {
  if (tokenCookie) {
    try {
      const { userId } = await jwt.verify(tokenCookie, process.env.APP_SECRET)
      console.log("userId", userId)
      return userId
    } catch (error) {
      console.log(error)
    }
  }
}
};

const schema = makeExecutableSchema({
  typeDefs: importSchema("./src/schema.graphql"),
  resolvers,
  authDirectiveResolvers,
});
const server = new ApolloServer({
  schema,
  debug: true,
  secret: process.env.PRISMA_SECRET,
   cacheControl: {
      defaultMaxAge: 5,
      stripFormattedExtensions: false,
      calculateCacheControlHeaders: true,
    },
  context: async (req, res) => {
    //this will be used for resolver level security / directives
    if (req) {
      const me = await getMe(req);
      return await {
        ...req,
        ...res,
        me,
        prisma,
      }
    }
  }
});

server.applyMiddleware({
  app,
  path: '/',
  cors: false
})
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
/**
  this is for session cookies authentication
*/
// app.use(
//     session({
//       name: "prisma",
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

httpServer.listen({ port }, () => { 
  console.log(`Server is running on http://localhost:${port}`),
  console.log(`Subscriptions ready at wss://us1.prisma.sh/public-shadowpirate-309/everybodyleave/dev`)
})

 

// app.post(endpoint, checkJwt, response) => {
//   response.send({
//     msg: "Your Access Token was successfully validated!"
//   });
// })


// server.start(options,  ({ port }) => console.log(`Server is running on http://localhost:${port}`));
