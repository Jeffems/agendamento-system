import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`ENV faltando: ${name}`);
  return v;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      callbackURL: requireEnv("GOOGLE_CALLBACK_URL"),
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Email não encontrado no perfil Google"), null);

        const googleId = profile.id;
        const nome = profile.displayName || null;
        const avatar = profile.photos?.[0]?.value || null;

        let usuario = await prisma.usuario.findUnique({ where: { email } });

        if (!usuario) {
          usuario = await prisma.usuario.create({
            data: { google_id: googleId, nome, email, avatar },
          });
        } else if (!usuario.google_id) {
          usuario = await prisma.usuario.update({
            where: { email },
            data: {
              google_id: googleId,
              nome: usuario.nome ?? nome,
              avatar: usuario.avatar ?? avatar,
            },
          });
        }

        return done(null, usuario);
      } catch (err) {
        console.error("❌ GoogleStrategy error:", err);
        return done(err, null);
      }
    }
  )
);

export default passport;