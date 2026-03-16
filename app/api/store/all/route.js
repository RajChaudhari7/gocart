import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {

  const stores = await prisma.store.findMany({
    where: {
      status: "approved"
    }
  })

  return NextResponse.json({ stores })

}