import { imagekit } from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const LOW_STOCK_LIMIT = 10;

// ================= ADD PRODUCT =================
export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    const storeId = await authSeller(userId)

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    const formData = await request.formData()

    const name = formData.get("name")
    const description = formData.get("description")
    const mrp = Number(formData.get("mrp"))
    const price = Number(formData.get("price"))
    const quantity = Math.max(0, Number(formData.get("quantity")) || 0)
    const category = formData.get("category")
    const barcode = formData.get("barcode")?.trim()
    const images = formData.getAll("images")

    if (!barcode) {
      return NextResponse.json(
        { error: "Barcode is required" },
        { status: 400 }
      )
    }

    if (price > mrp) {
      return NextResponse.json(
        { error: "Price cannot be greater than MRP" },
        { status: 400 }
      )
    }

    // 🔍 CHECK BARCODE (SAFE)
    const existingProduct = await prisma.product.findUnique({
      where: {
        barcode_storeId: {
          barcode,
          storeId,
        },
      },
    })

    // 🔁 BARCODE EXISTS → INCREMENT ONLY
    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          quantity: { increment: quantity > 0 ? quantity : 1 },
        },
      })

      return NextResponse.json({
        message: "Product exists. Quantity increased ✅",
        mode: "INCREMENT",
      })
    }

    // 🆕 NEW PRODUCT VALIDATION
    if (
      !name ||
      !description ||
      mrp <= 0 ||
      price <= 0 ||
      !category ||
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing product details for new product" },
        { status: 400 }
      )
    }

    // 📸 UPLOAD IMAGES
    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer())
        const upload = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        })

        return imagekit.url({
          path: upload.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        })
      })
    )

    // 🧾 CREATE PRODUCT
    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        quantity: quantity > 0 ? quantity : 1,
        category,
        images: imagesUrl,
        storeId,
        barcode,
      },
    })

    return NextResponse.json({
      message: "New product added successfully 🎉",
      mode: "CREATE",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}




// ================= GET SELLER PRODUCTS =================
export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        store: {
          select: {
            isActive: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })


    const formattedProducts = products.map((product) => ({
      ...product,
      lowStock:
        product.quantity > 0 &&
        product.quantity < LOW_STOCK_LIMIT,
      isOutOfStock: product.quantity <= 0, // ✅ frontend helper
    }));

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ================= UPDATE PRODUCT =================
export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { productId, price, quantity } = await request.json();

    if (!productId || price <= 0 || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid values" },
        { status: 400 }
      );
    }

    await prisma.product.update({
      where: { id: productId, storeId },
      data: {
        price,
        quantity, // ✅ ONLY quantity
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      isOutOfStock: quantity <= 0,
      lowStock: quantity > 0 && quantity < LOW_STOCK_LIMIT,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// ================= DELETE PRODUCT =================
export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: {
        id: productId,
        storeId,
      },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
