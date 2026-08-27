import { NextResponse } from "next/server";

export function rateLimitResponse(result) {
  const resetSeconds = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return NextResponse.json(
    {
      error: "Too many requests. Please try again shortly.",
      retryAfter: resetSeconds,
    },
    {
      status: 429,

      headers: {
        "Retry-After": String(resetSeconds),

        "X-RateLimit-Limit": String(result.limit),

        "X-RateLimit-Remaining": String(result.remaining),

        "X-RateLimit-Reset": String(result.reset),
      },
    },
  );
}
