import jwt from 'jsonwebtoken';

// Don't check secrets into the repository for production projects.
// Use for example environment variables instead.
// const TOKEN_SECRET = 'some-token-secret';

export default class Session {
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.userId = null;

    const { sessionToken } = request.cookies;
    this.initFromToken(sessionToken);
  }

  initFromToken(sessionToken) {
    if (!sessionToken) {
      return;
    }

    try {
      const { userId } = jwt.verify(sessionToken, `${process.env.APP_SECRET}`);
      this.userId = userId;
    } catch (error) {
      console.error('Error decoding session token', error);
    }
  }

  update(user) {
    if (!user) {
      return;
    }

    this.userId = user.id;

    const sessionToken = jwt.sign(
      { userId: user.id },
      `${process.env.APP_SECRET}`,
      // A session should not last for 1 year in production environments
      { expiresIn: '30d' },
    );
    const cookieOptions = {
      httpOnly: true,
      // use secure flag in production to send only via encrypted connections
      // secure: true,
    };
    this.response.cookie('sessionToken', sessionToken, cookieOptions);
  }
}

const sessionMiddleware = (request, response, next) => {
  request.session = new Session(request, response);
  next();
};

export default sessionMiddleware;