require('dotenv').config();
// const session =  require('express-session');
const { GraphQLServer } = require('graphql-yoga');
const { ApolloServer } = require("apollo-server-express");
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const parser = require("body-parser");
const { checkJwt } = require('./middleware/jwt');
const { getUser, getCookie } = require('./middleware/getUser');
const { makeExecutableSchema } = require("graphql-tools");
const { importSchema } = require("graphql-import");
const { validateAndParseToken } = require('./helpers/validateAndParseToken');
const resolvers = require('./resolvers');
const { prisma } = require("./prisma/generated/prisma-client");
const { authDirectiveResolvers } = require('./directives');
const { config } = require('./helpers/auth0Config');
// const { Cookies } = require("universal-cookie");
const Cookies = require('cookies');
const session = require('express-session');
const http = require('http');
const Logger = require("@ptkdev/logger");
const { verifyToken } = require('./helpers/auth0Authentication');
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
const port = `${process.env.PORT}` || 5000;
// const endpoint = `${process..PRISMA_ENDPOINT}`l
const endpoint = `http://localhost:5000/graphql`;
// const cookies = new Cookies();
const app = express();

const corsOptions = {
    port: 5000,
    origin: ["http://127.0.0.1", "http://localhost:3000"],
    credentials: true,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    preflightContinue: false,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With",
    optionsSuccessStatus: 204,
  };
app.use(cors(corsOptions));
app.use(helmet());
app.use(
  morgan("dev")
);

app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(compression());
app.use(cookieParser(process.env.APP_SECRET));
// app.use(cookieParser());


const schema = makeExecutableSchema({
  typeDefs: importSchema("./src/schema.graphql"),
  resolvers,
  authDirectiveResolvers,
});
const getMe = async (context) => {
  const Authorization = await context.req.get("Authorization");
  if (Authorization) {
        const token = await context.req.headers.authorization.split("Bearer ")[1]
        const decodedToken =  await verifyToken(token);
        const metadata = await decodedToken["https://everybodyleave.com/claims/user_metadata"]
        const userId = metadata.userId     
        console.log("userId: ", userId)
        return userId
      } 
 const checkCookie = await context.req.cookie("Authorization");
 console.log("cookie", checkCookie)
 if(checkCookie) {
    const { userId } = jwt.verify(checkCookie, `${process.env.APP_SECRET}`) 
    return userId
 }
   throw new AuthError()
} 

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
    let me;
    if (req) {
      try{
      const token = req.headers.authorization.split("Bearer ")[1]
      const decodedToken =  await verifyToken(token);
      const metadata = await decodedToken["https://everybodyleave.com/claims/user_metadata"];
      me = await metadata.userId;
      console.log("me: ", me) 
       return await {
        req,
        res,
        me,
        prisma,
       }
      } catch (err) {
        console.log("user is not authenticated")
      }
      // const me =  getMe(context)
      // console.log("me", me)
      return await {
        me,
        req,
        res,
        prisma,
       }
    };
  }
});

server.applyMiddleware({
  app,
  path: '/',
  cors: false,
});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);
httpServer.listen({ port }, () => { 
  console.log(`Server is running on http://localhost:${port}`),
  console.log(`Subscriptions ready at wss://us1.prisma.sh/public-shadowpirate-309/everybodyleave/dev`)
});