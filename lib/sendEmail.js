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
export const sendEmail = async ({
    to,
    subject,
    html,
    type = "order"
}) => {
    const fromName =
        type === "store" ? "Store Updates" : "Order Updates"

    await transporter.sendMail({
        from: `"${fromName}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    })
}

