import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  
  if (!header) return res.status(401).json({ message: "Missing token" });

  const token = header.split(" ")[1];
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware - Token verification failed:', err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
