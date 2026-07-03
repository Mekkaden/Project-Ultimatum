import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" } // 'login' or 'signup'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const { data: user, error: fetchError } = await supabaseAdmin
          .from("User")
          .select("*")
          .eq("email", credentials.email)
          .single();

        // If error is not PGRST116 (0 rows returned), throw it
        if (fetchError && fetchError.code !== "PGRST116") {
           throw new Error("Database error: " + fetchError.message);
        }

        // Signup flow
        if (credentials.action === "signup") {
          if (user) {
            throw new Error("User already exists");
          }
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          
          const { data: newUser, error: insertError } = await supabaseAdmin
            .from("User")
            .insert([{ id: crypto.randomUUID(), email: credentials.email, password: hashedPassword }])
            .select()
            .single();

          if (insertError || !newUser) {
             throw new Error("Failed to create user: " + (insertError?.message || "Unknown error"));
          }
          return { id: newUser.id, email: newUser.email };
        }

        // Login flow
        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
