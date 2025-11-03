import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth API handler
 * Handles all auth routes: /api/auth/*
 */
export const { GET, POST } = toNextJsHandler(auth);
