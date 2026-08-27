import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = Redis.fromEnv();

// GENERAL API

export const generalRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(120, "1 m"),

  analytics: true,

  prefix: "nandurbar-bazar:general",
});

// SEARCH / AUTOCOMPLETE

export const searchRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(40, "1 m"),

  analytics: true,

  prefix: "nandurbar-bazar:search",
});

// ORDER / CHECKOUT

export const orderRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(8, "1 m"),

  analytics: true,

  prefix: "nandurbar-bazar:orders",
});

// OTP / VERY SENSITIVE

export const otpRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(5, "5 m"),

  analytics: true,

  prefix: "nandurbar-bazar:otp",
});

// AI / EXPENSIVE

export const aiRateLimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(10, "1 m"),

  analytics: true,

  prefix: "nandurbar-bazar:ai",
});
