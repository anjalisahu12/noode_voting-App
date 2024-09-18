const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  //first check requst headers have authorization or not
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token not found" });

  //extract the jwt token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    //Verify the JWT Token
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decode", decode);

    ///attach user information to the  request object
    req.user = decode;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invailid Token" });
  }
};

//function to generate token
const generateToken = (userData) => {
  //generate new jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 3000 });
};
module.exports = { jwtAuthMiddleware, generateToken };
