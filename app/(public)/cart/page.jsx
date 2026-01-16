'use client'

import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';

    const { cartItems } = useSelector(state => state.cart);
    const products = useSelector(state => state.product.list);

    const dispatch = useDispatch();

    const [cartArray, setCartArray] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const createCartArray = () => {
        let total = 0;
        const arr = [];

        for (const [key, value] of Object.entries(cartItems)) {
            const product = products.find(product => product.id === key);
            if (product) {
                arr.push({
                    ...product,
                    quantity: value,
                });
                total += product.price * value;
            }
        }

        setCartArray(arr);
        setTotalPrice(total);
    };

    const handleDeleteItemFromCart = (productId) => {
        dispatch(deleteItemFromCart({ productId }));
    };

    useEffect(() => {
        if (products.length > 0) {
            createCartArray();
        }
    }, [cartItems, products]);

    return cartArray.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto">

                {/* Title */}
                <PageTitle
                    heading="My Cart"
                    text="items in your cart"
                    linkText="Add more"
                />

                <div className="flex items-start justify-between gap-5 max-lg:flex-col">

                    <table className="w-full max-w-4xl text-slate-600 table-auto">
                        <thead>
                            <tr className="max-sm:text-sm">
                                <th className="text-left">Product</th>
                                <th>Quantity</th>
                                <th>Total Price</th>
                                <th className="max-md:hidden">Remove</th>
                            </tr>
                        </thead>

                        <tbody>
                            {cartArray.map((item) => (
                                <tr key={item.id} className="border-b last:border-b-0">

                                    {/* Product */}
                                    <td className="flex gap-3 my-4">
                                        <div className="flex items-center justify-center bg-slate-100 size-18 rounded-md">
                                            <Image
                                                src={item.images[0]}
                                                alt={item.name}
                                                width={45}
                                                height={45}
                                                className="h-14 w-auto"
                                            />
                                        </div>

                                        <div>
                                            <p className="max-sm:text-sm font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {item.category}
                                            </p>
                                            <p className="text-sm">
                                                {currency}{item.price}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Quantity + Mobile Delete */}
                                    <td className="text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Counter productId={item.id} />

                                            {/* Mobile Remove */}
                                            <button
                                                onClick={() => handleDeleteItemFromCart(item.id)}
                                                className="md:hidden flex items-center gap-1 text-red-500 text-xs"
                                            >
                                                <Trash2Icon size={14} />
                                                Remove
                                            </button>
                                        </div>
                                    </td>

                                    {/* Total Price */}
                                    <td className="text-center">
                                        {currency}{(item.price * item.quantity).toLocaleString()}
                                    </td>

                                    {/* Desktop Remove */}
                                    <td className="text-center max-md:hidden">
                                        <button
                                            onClick={() => handleDeleteItemFromCart(item.id)}
                                            className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                                        >
                                            <Trash2Icon size={18} />
                                        </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <OrderSummary totalPrice={totalPrice} items={cartArray} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
            <h1 className="text-2xl sm:text-4xl font-semibold">
                Your cart is empty
            </h1>
        </div>
    );
}
