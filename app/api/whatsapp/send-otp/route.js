import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req){

    const { phone } = await req.json()

    const otp = Math.floor(100000 + Math.random()*900000).toString()

    const expires = new Date(Date.now() + 5*60*1000)

    await prisma.whatsappOtp.create({
        data:{
            phone,
            otp,
            expiresAt:expires
        }
    })

    const message = `Your GlobalMart verification code is ${otp}`

    const url = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
        success:true,
        url
    })
}