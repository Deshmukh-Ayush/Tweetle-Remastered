import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions: NextAuthOptions = {
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });

          if (
            !user ||
            !(await bcrypt.compare(credentials.password, user.password))
          ) {
            return null;
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email before signing in");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            username: user.username,
            image: user.profilePicture,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user: any;
      account: any;
    }) {
      if (account && user) {
        if (account.provider === "google") {
          try {
            await dbConnect();

            const existingUser = await User.findOne({ email: user.email });

            if (!existingUser) {
              const username = user.email?.split("@")[0] || "";
              const randomString = Math.random().toString(36).substring(2, 8);

              const newUser = new User({
                email: user.email,
                fullName: user.name || "Google User",
                username: `${username}_${randomString}`,
                password: bcrypt.hashSync(Math.random().toString(36), 10),
                dateOfBirth: new Date(),
                verifyCode: "",
                verifyCodeExpiry: new Date(),
                isVerified: true,
              });

              await newUser.save();

              token.id = newUser._id.toString();
              token.username = newUser.username;
            } else {
              token.id = existingUser._id.toString();
              token.username = existingUser.username;
            }
          } catch (error) {
            console.error("Error during Google auth:", error);
          }
        } else {
          token.id = user.id;
          token.username = user.username;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
