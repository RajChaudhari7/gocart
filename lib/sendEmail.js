import nodemailer from "nodemailer"

// 1️⃣ Create transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
// 2️⃣ Send email function
export const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"Order Updates" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        })

        console.log("✅ Email sent to:", to)
    } catch (error) {
        console.error("❌ Email failed:", error.message)
    }
}
