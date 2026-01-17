import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
        
            try {
                const email = profile.emails[0].value;

                let usuario = await prisma.usuario.findUnique({
                    where: { email },
                });

                if (!usuario) {
                    usuario = await prisma.usuario.create({
                        data: {
                            google_id: profile.id,
                            nome: profile.displayName,
                            email,
                            avatar: profile.photos?.[0]?.value || null,
                        },
                    });
                }

                return done(null, usuario);
            }   catch (error) {
                return done(error, null);
            }
        }
    )
);



export default passport;