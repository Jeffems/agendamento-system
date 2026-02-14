import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Email não encontrado no perfil Google"), null);

        const googleId = profile.id;
        const nome = profile.displayName;
        const avatar = profile.photos?.[0]?.value || null;

        let usuario = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!usuario) {
          // cria novo (Google)
          usuario = await prisma.usuario.create({
            data: {
              google_id: googleId,
              nome,
              email,
              avatar,
            },
          });
        } else if (!usuario.google_id) {
          // ✅ Opção A: usuário já existe (manual) -> linka Google nessa mesma conta
          usuario = await prisma.usuario.update({
            where: { email },
            data: {
              google_id: googleId,
              // não sobrescreve caso já tenha
              nome: usuario.nome ?? nome,
              avatar: usuario.avatar ?? avatar,
            },
          });
        }

        return done(null, usuario);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;