import { imagekit } from "@/configs/imageKit";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {

        const formData = await request.formData();

        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "File is required" },
                { status: 400 }
            );
        }

        // Convert File -> Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to ImageKit
        const uploaded = await imagekit.upload({
            file: buffer,
            fileName: `${Date.now()}-${file.name}`,
            folder: "/driver-documents"
        });

        return NextResponse.json({
            success: true,
            url: uploaded.url,
            fileId: uploaded.fileId
        });

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );

    }
}