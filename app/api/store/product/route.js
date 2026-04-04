import { imagekit } from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { authSeller } from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

const LOW_STOCK_LIMIT = 10;

// ================= ADD PRODUCT =================
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const barcode = formData.get("barcode")?.trim() || null;
    const images = formData.getAll("images");

    let parsedVariants = [];

    try {
      parsedVariants = JSON.parse(formData.get("variants") || "[]");
    } catch {
      parsedVariants = [];
    }

    // ✅ VALIDATION
    if (!name || !description || !category || images.length === 0) {
      return NextResponse.json(
        { error: "Missing product details" },
        { status: 400 }
      );
    }

    if (!parsedVariants.length) {
      return NextResponse.json(
        { error: "At least one variant required" },
        { status: 400 }
      );
    }

    // ================= BARCODE LOGIC =================
    if (barcode) {
      const existingProduct = await prisma.product.findFirst({
        where: { barcode, storeId },
        include: { variants: true },
      });

      if (existingProduct) {
        // Increase stock of ALL variants
        await prisma.variant.updateMany({
          where: { productId: existingProduct.id },
          data: { quantity: { increment: 1 } },
        });

        return NextResponse.json({
          message: "Product exists. Stock increased 📦",
          mode: "INCREMENT",
        });
      }
    }

    // ================= IMAGE UPLOAD =================
    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());

        const upload = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });

        return imagekit.url({
          path: upload.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
      })
    );

    // ================= CREATE PRODUCT + VARIANTS =================
    await prisma.product.create({
      data: {
        name,
        description,
        category,
        images: imagesUrl,
        storeId,
        barcode,

        variants: {
          create: parsedVariants.map((v) => ({
            size: v.size || null,
            color: v.color || null,
            weight: v.weight || null,
            mrp: Number(v.mrp),
            price: Number(v.price),
            quantity: Number(v.quantity),
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Product added successfully 🎉",
      mode: "CREATE",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// ================= GET PRODUCTS =================
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
        variants: true,
        store: {
          select: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedProducts = products.map((product) => {
      const totalQty = product.variants.reduce(
        (sum, v) => sum + v.quantity,
        0
      );

      return {
        ...product,
        totalQuantity: totalQty,
        lowStock: totalQty > 0 && totalQty < LOW_STOCK_LIMIT,
        isOutOfStock: totalQty <= 0,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

// ================= UPDATE VARIANT =================
export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { variantId, price, quantity } = await request.json();

    if (!variantId || price <= 0 || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid values" },
        { status: 400 }
      );
    }

    const variant = await prisma.variant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            store: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!variant || variant.product.storeId !== storeId) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    const oldQty = variant.quantity;

    await prisma.variant.update({
      where: { id: variantId },
      data: { price, quantity },
    });

    // ================= EMAIL ALERT =================
    const isLowStock =
      quantity > 0 &&
      quantity <= LOW_STOCK_LIMIT &&
      oldQty > LOW_STOCK_LIMIT;

    const isOutOfStock = quantity === 0 && oldQty !== 0;

    const STOCK_EMAIL = (productName, quantity) => `
      <div style="font-family: Arial; padding:20px;">
        <h2 style="color:#dc2626;">Stock Alert 🚨</h2>
        <p><b>Product:</b> ${productName}</p>
        <p><b>Current Stock:</b> ${quantity}</p>
        ${quantity === 0
        ? `<p style="color:red;">❌ Out of Stock</p>`
        : `<p style="color:orange;">⚠️ Low Stock</p>`
      }
      </div>
    `;

    if (isLowStock || isOutOfStock) {
      await sendEmail({
        to: variant.product.store.user.email,
        subject: `⚠️ Stock Alert - ${variant.product.name}`,
        html: STOCK_EMAIL(variant.product.name, quantity),
      });
    }

    return NextResponse.json({
      message: "Variant updated successfully",
      lowStock: quantity > 0 && quantity < LOW_STOCK_LIMIT,
      isOutOfStock: quantity <= 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
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

    await prisma.product.delete({
      where: { id: productId, storeId },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}