"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client for use in React components
 * Provides hooks and utilities for authentication
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

/**
 * Hooks from auth client
 */
export const { useSession, signIn, signOut, signUp } = authClient;
