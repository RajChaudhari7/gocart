import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const stores = await prisma.store.findMany({
      where: {
        status: "approved",
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}