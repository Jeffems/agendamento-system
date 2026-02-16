import jwt from "jsonwebtoken";

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

export function authMiddleware(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = {
      id: userId,
      email: decoded.email,
      nome: decoded.nome,
    };
    req.userId = userId;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
