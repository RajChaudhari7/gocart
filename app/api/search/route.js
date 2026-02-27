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
      
      -- Full Text Rank
      ts_rank(
        to_tsvector(
          'english',
          unaccent(
            coalesce(name,'') || ' ' ||
            coalesce(description,'') || ' ' ||
            coalesce(category,'')
          )
        ),
        plainto_tsquery('english', unaccent(${query}))
      ) AS text_rank,

      -- Trigram similarity (for typo tolerance)
      similarity(
        unaccent(name),
        unaccent(${query})
      ) AS similarity_score

      FROM "Product"

      WHERE
        (
          -- Full text search match
          to_tsvector(
            'english',
            unaccent(
              coalesce(name,'') || ' ' ||
              coalesce(description,'') || ' ' ||
              coalesce(category,'')
            )
          )
          @@ plainto_tsquery('english', unaccent(${query}))
        )
        OR
        (
          -- Trigram fuzzy match
          similarity(unaccent(name), unaccent(${query})) > 0.3
        )

      ORDER BY
        text_rank DESC,
        similarity_score DESC

      LIMIT 20;
    `

    return NextResponse.json(products)
  } catch (error) {
    console.error("Search Error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}