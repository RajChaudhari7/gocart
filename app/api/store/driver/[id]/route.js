import prisma from "@/lib/prisma"

export async function PATCH(req, { params }) {
  try {
    const body = await req.json()

    const driver = await prisma.driver.update({
      where: { id: params.id },
      data: {
        isActive: body.isActive
      }
    })

    return Response.json(driver)

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.driver.delete({
      where: { id: params.id }
    })

    return Response.json({ success: true })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}