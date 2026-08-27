export function getRateLimitIdentifier(request, userId = null) {
  /*
   * Logged-in customer:
   * rate limit using Clerk user ID.
   *
   * This is much better than only IP because
   * multiple users may share the same Wi-Fi/IP.
   */
  if (userId) {
    return `user:${userId}`;
  }

  /*
   * Guest customer:
   * use forwarded IP.
   */
  const forwardedFor = request.headers.get("x-forwarded-for");

  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}`;
}
