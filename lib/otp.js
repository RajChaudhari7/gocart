import crypto from "crypto"

// Generate 6 digit OTP
export const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString()
}

// Hash OTP
export const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex")
}

// Compare OTP
export const verifyOtp = (
  enteredOtp,
  storedHash
) => {

  const enteredHash = crypto
    .createHash("sha256")
    .update(String(enteredOtp))
    .digest("hex")

  return enteredHash === storedHash
}