import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

// MAIN AUTH CONFIG
export const authOptions = {
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt" as const,
  },

  providers: [
    // GOOGLE LOGIN
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // EMAIL + PASSWORD LOGIN
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing email or password");
        }

        // FETCH USER FROM SUPABASE TABLE
        const { data: user, error } = await supabase
          .from("app_users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        if (error || !user) {
          throw new Error("User not found");
        }

        // CHECK PASSWORD
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.user = user;
      }
      return token;
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = token.user;
      return session;
    },
  },
};

// AUTH HANDLERS
const handler = NextAuth(authOptions);

// EXPORTS REQUIRED FOR NEXT.JS ROUTE HANDLER
export { handler as GET, handler as POST };
