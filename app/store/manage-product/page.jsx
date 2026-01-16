'use client'

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  const { getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/store/product", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(
        data.products.map((p) => ({
          ...p,
          editPrice: p.price,
          editQuantity: p.quantity,
        }))
      );
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const updateProduct = async (product) => {
    const token = await getToken();

    await axios.put(
      "/api/store/product",
      {
        productId: product.id,
        price: Number(product.editPrice),
        quantity: Number(product.editQuantity),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              price: product.editPrice,
              quantity: product.editQuantity,
              inStock: product.editQuantity > 0,
            }
          : p
      )
    );
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl mb-5">Manage Products</h1>

      <table className="w-full text-sm border">
        <thead>
          <tr>
            <th>Product</th>
            <th>MRP</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Save</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="flex gap-2 items-center">
                <Image src={product.images[0]} width={40} height={40} alt="" />
                {product.name}
              </td>

              <td>{currency}{product.mrp}</td>

              <td>
                <input
                  type="number"
                  value={product.editPrice}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, editPrice: e.target.value }
                          : p
                      )
                    )
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  min={0}
                  value={product.editQuantity}
                  onChange={(e) =>
                    setProducts((prev) =>
                      prev.map((p) =>
                        p.id === product.id
                          ? { ...p, editQuantity: e.target.value }
                          : p
                      )
                    )
                  }
                />
              </td>

              <td>
                {product.inStock ? (
                  <span className="text-green-600">In Stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </td>

              <td>
                <button
                  onClick={() =>
                    toast.promise(updateProduct(product), {
                      loading: "Saving...",
                      success: "Updated",
                      error: "Error",
                    })
                  }
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
