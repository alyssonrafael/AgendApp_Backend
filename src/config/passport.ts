import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();
// Configura o Passport para usar a estratégia de autenticação do Google
passport.use(
  new GoogleStrategy(
    {
      // Define as credenciais da API do Google, obtidas das variáveis de ambiente
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extrai as informações do perfil do usuário autenticado pelo Google
        const user = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
          photo: profile.photos?.[0].value,
        };

        done(null, user); // Retorna os dados do usuário
      } catch (error) {
        // Em caso de erro, passa o erro para o callback do Passport
        done(error, undefined);
      }
    }
  )
);

export default passport;
