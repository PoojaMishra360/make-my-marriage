export const developmentUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;

export function developmentHeaders(): Record<string, string> { return developmentUserId ? { "x-development-user-id": developmentUserId } : {}; }
