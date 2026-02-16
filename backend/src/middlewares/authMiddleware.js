import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}
const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Token não enviado" });
  }

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
