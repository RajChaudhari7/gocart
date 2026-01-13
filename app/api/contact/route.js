import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400 }
      );
    }

    /* ==========================
       1️⃣ EMAIL TO ADMIN (YOU)
       ========================== */
    await resend.emails.send({
      from: "GoCart <onboarding@resend.dev>", // keep this until domain verified
      to: [process.env.CONTACT_EMAIL],        // YOUR email
      reply_to: email,                        // customer's email
      subject: "New Contact Message – GoCart",
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    /* ==========================
       2️⃣ AUTO-REPLY TO CUSTOMER ✅
       ========================== */
    await resend.emails.send({
      from: "GoCart <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message – GoCart",
      html: `
        <p>Hi ${name},</p>

        <p>Thank you for contacting <strong>GoCart</strong> 💖</p>

        <p>
          We have received your message and our support team will
          get back to you within <strong>24 hours</strong>.
        </p>

        <hr />

        <p><strong>Your message:</strong></p>
        <blockquote>${message}</blockquote>

        <br />

        <p>
          Best regards,<br/>
          <strong>GoCart Support Team</strong>
        </p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Contact error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500 }
    );
  }
}
