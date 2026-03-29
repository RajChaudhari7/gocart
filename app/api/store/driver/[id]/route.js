import { prisma } from "@/lib/prisma"

export async function PATCH(req, { params }) {
  const body = await req.json()

  const driver = await prisma.driver.update({
    where: { id: params.id },
    data: {
      isActive: body.isActive
    }
  })

  return Response.json(driver)
}

export async function DELETE(req, { params }) {
  await prisma.driver.delete({
    where: { id: params.id }
  })

  return Response.json({ success: true })
}