const _get = require("lodash.get");
const { skip } = require("graphql-resolvers");

const userLocationOnContext = "request.user";

const isLoggedIn = context => {
  const user = contextUser(context, userLocationOnContext);
  if (!user) throw new Error(`Not logged in`);
  return user;
};
const contextUser = context => _get(context, userLocationOnContext);

const isRequestingUserAlsoOwner = ({ context, userId, type, typeId }) =>
  context.prisma.exists[type]({ id: typeId, user: { id: userId } });
const isRequestingUser = ({ context, userId }) =>
  context.prisma.exists.User({ id: userId });

const directiveResolvers = {
  isAuthenticated: (parent, args, context) => {
    isLoggedIn(context);
    return skip;
  },
  hasRole: (parent, { roles }, context) => {
    const { role } = isLoggedIn(context);
    if (roles.includes(role)) {
      return skip;
    }
    throw new Error(`Unauthorized, incorrect role`);
  },
  isOwner: async (parent, { type }, context) => {
    const { id: typeId } =
      parent && parent.id
        ? parent
        : context.request.body.variables
        ? context.request.body.variables
        : { id: null };
    const { id: userId } = isLoggedIn(context);
    const isOwner =
      type === `User`
        ? userId === typeId
        : await isRequestingUserAlsoOwner({ context, userId, type, typeId });
    if (isOwner) {
      return skip;
    }
    throw new Error(`Unauthorized, must be owner`);
  },
  isOwnerOrHasRole: async (parent, { roles, type }, context, ...p) => {
    const { id: userId, role } = isLoggedIn(context);
    if (roles.includes(role)) {
      return skip;
    }

    const { id: typeId } = context.request.body.variables;
    const isOwner = await isRequestingUserAlsoOwner({
      context,
      userId,
      type,
      typeId
    });

    if (isOwner) {
      return skip;
    }
    throw new Error(`Unauthorized, not owner or incorrect role`);
  }
};

module.exports = { directiveResolvers };
