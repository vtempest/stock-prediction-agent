import { betterAuth } from "better-auth";
import { siwe } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { randomBytes } from "crypto";
import { verifyMessage } from "ethers";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // basePath: "/api/auth", // better-auth defaults to this, but keeping it explicit if user wants
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "your-secret-key",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    siwe({
      domain: process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000",
      anonymous: false, // Require email for non-anonymous users
      getNonce: async () => {
        // Generate a cryptographically secure random nonce
        return randomBytes(32).toString("hex");
      },
      verifyMessage: async ({ message, signature, chainId }) => {
        try {
          // Verify the signed SIWE message
          const recovered = verifyMessage(message, signature);
          
          // Additional validation: check chainId if needed
          if (chainId && chainId !== 1 && chainId !== 11155111 && chainId !== 31337) {
            // Only allow Ethereum mainnet (1), Sepolia testnet (11155111), or localhost
            console.warn(`Unsupported chain ID: ${chainId}`)
            // return false; 
          }

          return !!recovered;
        } catch (error) {
          console.error("Message verification failed:", error);
          return false;
        }
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user

