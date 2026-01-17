const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "default_secret";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded; // { id, email, role }
    next();
  });
};

module.exports = verifyToken;
