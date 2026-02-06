import PDFDocument from "pdfkit"

export async function generateInvoicePdf({ order, store }) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 40 })
    const buffers = []

    doc.on("data", buffers.push.bind(buffers))
    doc.on("end", () => resolve(Buffer.concat(buffers)))

    // ===== HEADER =====
    doc.fontSize(22).text(store.name || "Store", { align: "right" })
    doc.moveDown(0.5)
    doc.fontSize(12).text("INVOICE", { align: "right" })
    doc.moveDown()

    doc.fontSize(10)
    doc.text(`Order ID: ${order.id}`)
    doc.text(`Date: ${new Date().toLocaleDateString()}`)
    doc.moveDown()

    // ===== CUSTOMER =====
    doc.fontSize(12).text("Billed To:", { underline: true })
    doc.text(order.user?.name || "Customer")
    doc.text(order.user?.email)
    doc.moveDown()

    // ===== TABLE HEADER =====
    doc.fontSize(11)
    doc.text("Product", 40)
    doc.text("Qty", 300)
    doc.text("Price", 350)
    doc.text("Total", 420)
    doc.moveDown(0.5)

    let grandTotal = 0

    order.orderItems.forEach(item => {
      const total = item.price * item.quantity
      grandTotal += total

      doc.text(item.product?.name || "Product", 40)
      doc.text(item.quantity.toString(), 300)
      doc.text(`₹${item.price}`, 350)
      doc.text(`₹${total}`, 420)
      doc.moveDown()
    })

    doc.moveDown()
    doc.fontSize(12).text(`Grand Total: ₹${grandTotal}`, { align: "right" })

    doc.moveDown(2)
    doc.fontSize(10).text("Thank you for shopping with us!")

    doc.end()
  })
}
