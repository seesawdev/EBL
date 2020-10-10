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
const { validateAndParseToken } = require('./helpers/validateAndParseToken')
const resolvers = require('./resolvers')
const { prisma } = require("./prisma/generated/prisma-client");
const { authDirectiveResolvers } = require('./directives')
const { config } = require('./helpers/auth0Config')
// const { Cookies } = require("universal-cookie");
const Cookies = require('cookies') 
const session = require('express-session')
const http = require('http')
const Logger = require("@ptkdev/logger");
const { verifyToken } = require('./helpers/auth0Authentication')
const options = {
  language: "en",
  colors: true,
  debug: true,
  info: true,
  warning: true,
  error: true,
  sponsor: true,
  write: true,
  type: "log",
  path: {
    debug_log: "./debug.log",
    error_log: "./errors.log",
  },
};

const logger = new Logger(options);
logger.info("message");
const port = `${process.env.PORT}` || 5000
// const endpoint = `${process..PRISMA_ENDPOINT}`
const endpoint = `http://localhost:5000/graphql`;

// const cookies = new Cookies()
const app = express()
/**
  this is for session cookies authentication
*/
// app.use(
//     session({
//       name: "prisma",
//       secret: process.env.SESSION_SECRET,
//       resave: true,
//       saveUninitialized: false,
//       cookie: {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
//       }
//     })
//   );
const corsOptions = {
    port: 5000,
    origin: ["http://127.0.0.1", "http://localhost:3000"],
    credentials: true,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    preflightContinue: false,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With",
    optionsSuccessStatus: 204,
  }
app.use(cors(corsOptions))
app.use(helmet());
app.use(
  morgan("dev")
);

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(compression());
app.use(cookieParser(process.env.APP_SECRET));
// app.use('/',checkJwt, (err, req, res, next) => {
//     if (err) return res.status(401).send(err.message)
//     next()
//   }
// )
// app.post('/', (req, res, next) =>
//   getUser(req, res, next, prisma)
// )
// app.use(checkJwt) 
// app.use((req, res, next) => {
//   req.cookies = new Cookies(req, res);
//   const tokenCookie = req.cookies.authorization
//   if(!tokenCookie) {
//     console.log("please log back in to continue")
//       next();
//   }
// })

//gets the logged in user, implemented for resolver level security in authResolvers file
const getMe = async (context) => {
  // const tokenCookie = await context.req.cookies
  // console.log("tokenCookie @getMe: ", tokenCookie)
  let user
  // const Authorization = context.req.cookies.get("auth0.is.authenticated", { signed: true });
  const Authorization = await context.req.headers.authorization
  if (Authorization) {
      try {
        const token = await context.req.headers.authorization.split("Bearer ")[1]
        const decodedToken =  await verifyToken(token);
        // if (!decodedToken) {
          //  const { userId } = jwt.verify(token, `${process.env.APP_SECRET}`)
          //  console.log(userId)

          //  return userId
        // }
        const metadata = await decodedToken["https://everybodyleave.com/claims/user_metadata"]
        const userId = metadata.userId
       
        console.log(userId)
        return userId
      // } 
      } catch (error) {
        console.log(error);
      }
      } 
      // else {
  // if (tokenCookie) {
  //   try {
  //     const { userId } = await jwt.verify(tokenCookie, process.env.APP_SECRET)
  //     console.log("userId", userId)
  //     return userId
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }
// }
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
  cors: false,
   cacheControl: {
      defaultMaxAge: 900,
      stripFormattedExtensions: false,
      calculateCacheControlHeaders: true,
    },
  context: async ({ req, res }) => {
    //this will be used for resolver level security / directives
    if (req) {
      const token = req.headers.authorization.split("Bearer ")[1]
      const decodedToken =  await verifyToken(token);
      const metadata = await decodedToken["https://everybodyleave.com/claims/user_metadata"]
      const me = await metadata.userId
     // console.log("me: ", me)
   
       return {
        req,
        res,
        me,
        prisma,
      }
    }
  }
});

server.applyMiddleware({
  app,
  path: '/',
  cors: false,
})

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);


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
