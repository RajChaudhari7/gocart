import prisma from "@/lib/prisma"

export async function assignDriver(orderId) {

    const drivers = await prisma.driver.findMany({
        where: {
            isOnline: true,
            isActive: true
        }
    })

    if (!drivers.length) return

    const selectedDriver =
        drivers[Math.floor(Math.random() * drivers.length)]

    await prisma.order.update({
        where: {
            id: orderId
        },
        data: {
            driverId: selectedDriver.id,
            assignedAt: new Date()
        }
    })
}