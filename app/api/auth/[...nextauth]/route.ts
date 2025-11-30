import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

type User = {
  id: string;
  email: string;
  password: string; // hashed password
};

// TEMPORARY in-memory users array (we'll replace with a real database later)
const users: User[] = [];

const handler = NextAuth({
  providers: [
    // Google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    // Email + password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        // Find user by email in our temporary in-memory list
        const user = users.find((u) => u.email === credentials.email);
        if (!user) return null;

        const match = await bcrypt.compare(credentials.password, user.password);
        if (!match) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Attach user info to the token
        // @ts-ignore
        token.user = user;
      }
      return token;
    },

    async session({ session, token }) {
      // @ts-ignore
      session.user = token.user;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
