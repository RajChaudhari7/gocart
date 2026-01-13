import sendEmail from "@/lib/sendEmail";

export async function POST(req) {
  try {
    const { name, email, message } = await req.json();

    // Create email content
    const emailBody = `
      <h2>Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;

    // Send email via Brevo SMTP
    await sendEmail({
      to: process.env.SENDER_EMAIL, // your receiving email
      subject: `New Contact Form Submission from ${name}`,
      body: emailBody,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
