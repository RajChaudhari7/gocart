import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query || query.trim() === "") {
    return NextResponse.json([])
  }

  try {
    const products = await prisma.$queryRaw`
      SELECT *,
      ts_rank(
        to_tsvector(
          'english',
          coalesce(name,'') || ' ' ||
          coalesce(description,'') || ' ' ||
          coalesce(category,'')
        ),
        plainto_tsquery('english', ${query})
      ) AS rank
      FROM "Product"
      WHERE to_tsvector(
        'english',
        coalesce(name,'') || ' ' ||
        coalesce(description,'') || ' ' ||
        coalesce(category,'')
      )
      @@ plainto_tsquery('english', ${query})
      ORDER BY rank DESC
      LIMIT 20;
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}