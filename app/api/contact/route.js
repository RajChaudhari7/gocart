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


await resend.emails.send({
from: "GoCart <onboarding@resend.dev>",
to: [process.env.CONTACT_EMAIL || "onboarding@resend.dev"],
subject: "New Contact Message – GoCart",
reply_to: email,
html: `
<h2>New Contact Message</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>
`,
});


return Response.json({ success: true });
} catch (error) {
console.error(error);
return new Response(
JSON.stringify({ error: "Failed to send email" }),
{ status: 500 }
);
}
}