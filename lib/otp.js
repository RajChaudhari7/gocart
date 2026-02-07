// lib/otp.js
import crypto from "crypto"

// generate 6-digit OTP
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// hash OTP (never store plain OTP)
export const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex")
}
