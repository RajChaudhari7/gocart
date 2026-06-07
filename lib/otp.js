import crypto from "crypto"

export const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString()
}

export const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex")
}

export const verifyOtp = (
  plainOtp,
  hashedOtp
) => {

  const hashedInput = crypto
    .createHash("sha256")
    .update(String(plainOtp))
    .digest("hex")

  return hashedInput === hashedOtp
}