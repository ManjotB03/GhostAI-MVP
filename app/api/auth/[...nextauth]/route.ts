import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";
import { saveUserToSupabase } from "./authorize";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },  
  session: {
    strategy: "jwt",
  },  
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }), 

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const { data: user, error } = await supabase
          .from("app_users")
          .select("*")
          .eq("email", credentials.email)
          .single();  

        if (error || !user) {
          console.error("Supabase error:", error);
          return null;
        } 

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isPasswordValid) {
          console.error("Invalid password for user:", credentials.email);
          return null;
        } 

        return { id: user.id, email: user.email };
      },
    }),
  ],  

    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.user = user;

          await saveUserToSupabase(user);
        }
        return token;
      },
  
      async session({ session, token }: any) {
        session.user = token.user;
        return session;
      },
    },
  };

// Create NextAuth handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
