// const { Context } = require('graphql-yoga');
const jwt, { Secret } = require('jsonwebtoken');
const { secret } = require('./secret');

const { appSecret, refreshSecret } = secrets;
export const encode = (args, secret, options) => {
    return jwt.sign(args, secret, options);

};
export const decode = (args, secret) => {
    const decoded = jwt.verify(args, secret);
    if (!decoded) {
        throw new Error("Invalid Token");
    }
    return decoded;
};
export const generateAccessToken = (args) => {
    const token = encode(args, appSecret, { expiresIn: "15m" });
    return token;
};

export const generateRefreshCookie = (args, response) => {
    const refreshToken = encode(args, refreshSecret, { expiresIn: "30d" });
    const auth = response.cookie("refreshtoken", refreshToken, {
        expiresIn: "30d",
        httpOnly: true,
        secure: false,
    });
    return auth;
};
export const generateAuth0RefreshCookie = (auth0Object, response) => {
    const auth = response.cookie("refreshToken", auth0Object.refreshToken, {
        expiresIn: 2592000,
        httpOnly: true,
        secure: false
    })
    return auth;
}

export const verifyToken = (request) => {
    const token = request.headers.authorization.split(" ")[1];
    if (token) {
        const decoded = decode(token, appSecret);
        return decoded;
    }
    throw new Error("Not Authenticated");
};

module.exports = {
    encode, 
    decode,
    generateRefreshCookie,
    generateAuth0RefreshCookie,
    verifyToken,
}