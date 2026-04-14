// Route protection is handled per-page via getCurrentUser().
// The NextAuth default middleware was redirecting authenticated users
// due to JWT verification issues in the edge runtime.
export const config = { matcher: [] };
