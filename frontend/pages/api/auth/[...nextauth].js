import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Forward credentials to backend login endpoint
        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/auth/login`, {
            email: credentials.email,
            password: credentials.password
          }, { timeout: 10000 });

          if (res.data?.token) {
            // Return user object to NextAuth; store backend token on the token in callbacks
            return { id: res.data.user.id, email: res.data.user.email, backendToken: res.data.token, role: res.data.user.role };
          } else {
            return null;
          }
        } catch (err) {
          console.error("Authorize error", err?.response?.data || err.message);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken ?? token.backendToken;
        token.role = user.role ?? token.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.backendToken;
      session.user = session.user || {};
      session.user.role = token.role;
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET || "change_me"
});
