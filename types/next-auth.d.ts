import NextAuth, { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      /** Default properties */
      name?: string | null
      email?: string | null
      image?: string | null
      /** Custom properties */
      id: string           // added ownerId / user id
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string            // added for token storage
    role?: string
  }
}
