import { clerkClient } from "@clerk/nextjs/server";

export const authAdmin = async (userId) => {
    try {
        if (!userId) return false;

        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        const adminEmails = process.env.ADMIN_EMAIL
            .split(",")
            .map(email => email.trim().toLowerCase());

        const userEmail = user.emailAddresses[0].emailAddress
            .trim()
            .toLowerCase();

        return adminEmails.includes(userEmail);

    } catch (error) {
        console.error(error);
        return false;
    }
};