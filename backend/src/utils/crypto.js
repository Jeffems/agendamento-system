import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const SECRET = process.env.WHATSAPP_CONFIG_SECRET;

function getKey() {
  if (!SECRET) {
    throw new Error("WHATSAPP_CONFIG_SECRET não configurada");
  }

  return crypto.createHash("sha256").update(SECRET).digest();
}

export function encrypt(text) {
  if (!text) return null;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(payload) {
  if (!payload) return null;

  const [ivHex, encrypted] = payload.split(":");
  if (!ivHex || !encrypted) {
    throw new Error("Token criptografado inválido");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}