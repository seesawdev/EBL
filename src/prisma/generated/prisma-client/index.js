"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_lib_1 = require("prisma-client-lib");
var typeDefs = require("./prisma-schema").typeDefs;

var models = [
  {
    name: "Post",
    embedded: false
  },
  {
    name: "User",
    embedded: false
  },
  {
    name: "TIER",
    embedded: false
  },
  {
    name: "Goal",
    embedded: false
  },
  {
    name: "UserStatus",
    embedded: false
  },
  {
    name: "ProfileStatus",
    embedded: false
  },
  {
    name: "JournalEntry",
    embedded: false
  },
  {
    name: "AuthPayload",
    embedded: false
  },
  {
    name: "FormData",
    embedded: false
  },
  {
    name: "Question",
    embedded: false
  },
  {
    name: "Role",
    embedded: false
  }
];
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `https://us1.prisma.sh/public-shadowpirate-309/everybodyleave/dev`,
  secret: `${process.env["PRISMA_SECRET"]}`
});
exports.prisma = new exports.Prisma();
