'use client'

import { useEffect, useRef, useState } from "react"
import Loading from "@/components/Loading"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { toast } from "sonner";
import { useOrderStore } from "@/hooks/use-order-store"

const SELLER_STATUSES = [
    "ORDER_PLACED",
    "ORDER_CONFIRMED",
    "ORDER_PACKING",
    "ORDER_PACKED"
]



export default function StoreOrders() {
    const { getToken } = useAuth()
    const { setOrderCount } = useOrderStore()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const audioRef = useRef(null);
    const [commission, setCommission] = useState(10);
    const [settings, setSettings] = useState({
        commissionPercent: 10,
        deliveryFee: 50,
        driverFee: 30,
    });

    const getOrderFinances = (order) => {
        const productTotal = (order.orderItems || []).reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0
        );

        const commission =
            order.commissionPercent ?? settings.commissionPercent ?? 10;

        const platformFee = (productTotal * commission) / 100;

        const sellerEarnings = productTotal - platformFee;

        const deliveryFee =
            order.deliveryFee ?? settings.deliveryFee ?? 0;

        return {
            productTotal,
            platformFee,
            sellerEarnings,
            deliveryFee
        };
    };

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        audioRef.current = new Audio("/sounds/order.mp3");
    }, []);

    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get('/api/store/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.orders.length > orders.length) {
                    audioRef.current.play().catch(e => console.log("Audio play blocked:", e));
                    toast.success("New order received!");
                }
                setOrders(data.orders);
                setOrderCount(data.activeCount);
                setCommission(data.settings?.commissionPercent || 10);
                setSettings(data.settings);
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [orders.length]);

    // Filter only active (non-finished) orders
    const activeOrders = orders.filter(order =>
        !["DELIVERED", "CANCELLED", "RETURNED"].includes(order.status)
    );

    const fetchOrders = async () => {
        try {
            const token = await getToken();

            const { data } = await axios.get("/api/store/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setOrders(data.orders);
            setOrderCount(data.activeCount);
            setCommission(data.settings?.commissionPercent || 10);
            setSettings(data.settings);

        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };
    const updateOrderStatus = async (order, newStatus) => {
        const currentIndex = SELLER_STATUSES.indexOf(order.status)
        const newIndex = SELLER_STATUSES.indexOf(newStatus)

        if (newIndex < currentIndex) {
            toast.error("You cannot move order status backwards")
            return
        }

        try {
            const token = await getToken();
            await axios.post(
                '/api/store/orders',
                { orderId: order.id, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchOrders();
            toast.success(`Order status updated to ${newStatus}`);
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message);
        }
    };



    const cancelOrder = async (order) => {
        if (order.status === "DELIVERED" || order.status === "CANCELLED") return
        if (!confirm("Are you sure you want to cancel this order?")) return

        try {
            const token = await getToken()
            await axios.post(
                '/api/orders/cancel',
                { orderId: order.id },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            toast.success("Order canceled successfully")
            fetchOrders()
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }


    /* ================= PDF EXPORTS ================= */
    const downloadReportPDF = async () => {
        const getBase64Image = (url) => {
            return new Promise((resolve) => {
                if (!url) return resolve('');
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = url;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve('');
            });
        };

        const store = filteredOrders[0]?.store || {}
        const logoBase64 = await getBase64Image(store?.logo)

        const reportDiv = document.createElement('div')
        reportDiv.style.width = '1000px'
        reportDiv.style.padding = '50px'
        reportDiv.style.background = '#ffffff'
        reportDiv.style.fontFamily = 'Inter, system-ui, sans-serif'
        reportDiv.style.color = '#0f172a'

        reportDiv.innerHTML = `
        <div style="border:1px solid #e5e7eb; border-radius:16px; padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div style="display:flex; align-items:center; gap:15px;">
                    ${logoBase64 ? `<img src="${logoBase64}" style="height:50px; border-radius:10px;" />` : ''}
                    <div>
                        <h1 style="margin:0; font-size:24px; font-weight:700;">${store?.name || "Store"}</h1>
                        <p style="margin:2px 0; font-size:13px; color:#64748b;">Premium Sales & Payout Report</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <p style="font-size:12px; color:#94a3b8; margin:0;">Generated On</p>
                    <p style="font-size:13px; font-weight:600;">${new Date().toLocaleString()}</p>
                </div>
            </div>

            <div style="margin-bottom:25px;">
                <h2 style="margin:0; font-size:20px; font-weight:600; color:#4f46e5;">Earnings Analytics</h2>
                <p style="margin:5px 0; color:#64748b;">
                    ${selectedDate ? `Date: ${new Date(selectedDate).toLocaleDateString()}` : `Month: ${months[selectedMonth]} ${selectedYear}`}
                </p>
            </div>

            <div style="display:flex; gap:20px; margin-bottom:30px;">
                <div style="flex:1; background:#ecfdf5; padding:20px; border-radius:12px;">
                    <p style="margin:0; font-size:13px; color:#059669;">Net Earnings (90%)</p>
                    <h2 style="margin-top:5px;">₹${revenue.toFixed(2)}</h2>
                </div>
                <div style="flex:1; background:#fee2e2; padding:20px; border-radius:12px;">
                    <p style="margin:0; font-size:13px; color:#dc2626;">Lost Value (Cancelled)</p>
                    <h2 style="margin-top:5px;">₹${cancelledAmount.toFixed(2)}</h2>
                </div>
                <div style="flex:1; background:#fff7ed; padding:20px; border-radius:12px;">
                    <p style="margin:0; font-size:13px; color:#ea580c;">Lost Value (Returned)</p>
                    <h2 style="margin-top:5px;">₹${returnedAmount.toFixed(2)}</h2>
                </div>
            </div>

            <table style="width:100%; border-collapse:separate; border-spacing:0 10px;">
                <thead>
                    <tr style="text-align:left; font-size:13px; color:#64748b;">
                        <th style="padding:10px;">Customer</th>
                        <th style="padding:10px;">Date</th>
                        <th style="padding:10px;">Status</th>
                        <th style="padding:10px; text-align:right;">₹${finances.platformFee.toFixed(2)}</th>
                        <th style="padding:10px; text-align:right;">Your Earnings</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredOrders.map(order => {
            const finances = getOrderFinances(order, commission);
            let statusColor = "#eab308";
            let bgColor = "#fef9c3";

            if (order.status === "DELIVERED") { statusColor = "#16a34a"; bgColor = "#dcfce7"; }
            if (order.status === "CANCELLED") { statusColor = "#dc2626"; bgColor = "#fee2e2"; }
            if (order.status === "RETURNED") { statusColor = "#ea580c"; bgColor = "#ffedd5"; }

            return `
                        <tr style="background:#f9fafb;">
                            <td style="padding:12px; border-top-left-radius:10px; border-bottom-left-radius:10px;">${order.user?.name}</td>
                            <td style="padding:12px;">${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style="padding:12px;">
                                <span style="padding:6px 12px; border-radius:999px; font-size:12px; font-weight:600; color:${statusColor}; background:${bgColor}; display:inline-block;">
                                    ${order.status}
                                </span>
                            </td>
                            <td style="padding:12px; text-align:right; color:#ef4444;">-₹${finances.platformFee.toFixed(2)}</td>
                            <td style="padding:12px; text-align:right; font-weight:600; color:#10b981; border-top-right-radius:10px; border-bottom-right-radius:10px;">
                                ₹${finances.sellerEarnings.toFixed(2)}
                            </td>
                        </tr>
                        `
        }).join('')}
                </tbody>
            </table>
        </div>
        `

        document.body.appendChild(reportDiv)
        const canvas = await html2canvas(reportDiv, { scale: 2 })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'pt', 'a4')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`Earnings-Report-${Date.now()}.pdf`)
        document.body.removeChild(reportDiv)
    }

    const escapeHTML = (value) => {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const storeNameSafe = (value) => {
        return escapeHTML(value || "Store");
    };

    const downloadInvoicePDF = async (order) => {
        if (!order) {
            toast.error("Order information is unavailable.");
            return;
        }

        const getBase64Image = async (url) => {
            if (!url) return null;

            try {
                const response = await fetch(url, {
                    mode: "cors",
                });

                if (!response.ok) return null;

                const blob = await response.blob();

                return await new Promise((resolve) => {
                    const reader = new FileReader();

                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);

                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error("Invoice image error:", error);
                return null;
            }
        };

        try {
            toast.loading("Preparing invoice...", {
                id: "invoice-pdf",
            });

            const logoBase64 = await getBase64Image(order.store?.logo);

            /*
             * Use the actual order delivery fee.
             * Fallback only if the order does not contain it.
             */
            const deliveryFee = Number(
                order.deliveryFee ??
                order.shippingFee ??
                settings?.deliveryFee ??
                0
            );

            /*
             * Calculate product subtotal from order items.
             */
            const productSubtotal = (order.orderItems || []).reduce(
                (sum, item) =>
                    sum +
                    Number(item.price || 0) *
                    Number(item.quantity || 0),
                0
            );

            /*
             * Use the actual order total as the final customer-paid amount.
             * This is important if coupons/discounts are applied.
             */
            const totalPaid = Number(order.total || 0);

            const invoiceNumber =
                order.id?.slice(-8)?.toUpperCase() || "N/A";

            const orderDate = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "N/A";

            const orderTime = order.createdAt
                ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                : "";

            const customerName =
                order.user?.name ||
                order.address?.name ||
                "Customer";

            const customerPhone =
                order.address?.phone ||
                order.user?.phone ||
                "N/A";

            const customerEmail =
                order.user?.email ||
                "N/A";

            const address = order.address || {};

            const fullAddress = [
                address.street,
                address.city,
                address.state,
                address.zip,
                address.country,
            ]
                .filter(Boolean)
                .join(", ");

            /*
             * Build invoice HTML using ONLY inline styles.
             *
             * This is intentionally isolated from your application's
             * Tailwind/global CSS to prevent html2canvas from seeing
             * unsupported OKLCH colors.
             */
            const invoiceHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />

                <style>
                    * {
                        box-sizing: border-box;
                    }

                    html,
                    body {
                        margin: 0;
                        padding: 0;
                        background: #ffffff;
                    }

                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        color: #111827;
                    }

                    .invoice {
                        width: 800px;
                        background: #ffffff;
                        padding: 45px;
                    }

                    .top-border {
                        height: 6px;
                        background: #4f46e5;
                        border-radius: 4px 4px 0 0;
                    }

                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding: 30px 0 25px;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .store-section {
                        display: flex;
                        align-items: center;
                        gap: 15px;
                    }

                    .store-logo {
                        width: 64px;
                        height: 64px;
                        object-fit: cover;
                        border-radius: 12px;
                        border: 1px solid #e5e7eb;
                    }

                    .store-name {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .store-subtitle {
                        margin: 5px 0 0;
                        font-size: 12px;
                        color: #6b7280;
                    }

                    .invoice-title {
                        text-align: right;
                    }

                    .invoice-title h2 {
                        margin: 0;
                        font-size: 24px;
                        font-weight: 700;
                        color: #4f46e5;
                    }

                    .invoice-number {
                        margin: 6px 0 0;
                        font-size: 12px;
                        color: #6b7280;
                    }

                    .info-grid {
                        display: flex;
                        gap: 25px;
                        margin-top: 28px;
                    }

                    .info-card {
                        flex: 1;
                        background: #f8fafc;
                        border: 1px solid #e5e7eb;
                        border-radius: 10px;
                        padding: 18px;
                    }

                    .info-title {
                        margin: 0 0 10px;
                        font-size: 11px;
                        font-weight: 700;
                        color: #6b7280;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }

                    .info-main {
                        margin: 0 0 5px;
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .info-text {
                        margin: 3px 0;
                        font-size: 12px;
                        line-height: 1.5;
                        color: #4b5563;
                    }

                    .items-title {
                        margin: 30px 0 12px;
                        font-size: 16px;
                        font-weight: 700;
                        color: #111827;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    thead tr {
                        background: #111827;
                        color: #ffffff;
                    }

                    th {
                        padding: 12px;
                        font-size: 11px;
                        text-align: left;
                        font-weight: 700;
                    }

                    th.center {
                        text-align: center;
                    }

                    th.right {
                        text-align: right;
                    }

                    td {
                        padding: 13px 12px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 12px;
                        color: #374151;
                    }

                    td.center {
                        text-align: center;
                    }

                    td.right {
                        text-align: right;
                    }

                    .product-name {
                        font-weight: 600;
                        color: #111827;
                    }

                    .summary-wrapper {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 25px;
                    }

                    .summary {
                        width: 300px;
                    }

                    .summary-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 7px 0;
                        font-size: 13px;
                        color: #6b7280;
                    }

                    .summary-total {
                        display: flex;
                        justify-content: space-between;
                        margin-top: 10px;
                        padding-top: 14px;
                        border-top: 2px solid #111827;
                        font-size: 18px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .payment-box {
                        margin-top: 30px;
                        padding: 15px 18px;
                        background: #eef2ff;
                        border: 1px solid #c7d2fe;
                        border-radius: 10px;
                    }

                    .payment-label {
                        margin: 0 0 4px;
                        font-size: 10px;
                        font-weight: 700;
                        color: #6366f1;
                        text-transform: uppercase;
                    }

                    .payment-value {
                        margin: 0;
                        font-size: 13px;
                        font-weight: 700;
                        color: #312e81;
                    }

                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        text-align: center;
                    }

                    .footer-title {
                        margin: 0;
                        font-size: 14px;
                        font-weight: 700;
                        color: #111827;
                    }

                    .footer-text {
                        margin: 6px 0 0;
                        font-size: 11px;
                        color: #6b7280;
                    }
                </style>
            </head>

            <body>
                <div class="invoice">

                    <div class="top-border"></div>

                    <!-- HEADER -->
                    <div class="header">

                        <div class="store-section">

                            ${logoBase64
                    ? `
                                    <img
                                        class="store-logo"
                                        src="${logoBase64}"
                                    />
                                    `
                    : ""
                }

                            <div>
                                <h1 class="store-name">
                                    ${storeNameSafe(order.store?.name)}
                                </h1>

                                <p class="store-subtitle">
                                    Nandurbar Bazar
                                </p>
                            </div>

                        </div>

                        <div class="invoice-title">

                            <h2>
                                INVOICE
                            </h2>

                            <p class="invoice-number">
                                #${invoiceNumber}
                            </p>

                            <p class="invoice-number">
                                ${orderDate} ${orderTime}
                            </p>

                        </div>

                    </div>


                    <!-- CUSTOMER / ORDER INFO -->
                    <div class="info-grid">

                        <div class="info-card">

                            <p class="info-title">
                                Bill To
                            </p>

                            <p class="info-main">
                                ${escapeHTML(customerName)}
                            </p>

                            <p class="info-text">
                                ${escapeHTML(customerEmail)}
                            </p>

                            <p class="info-text">
                                ${escapeHTML(customerPhone)}
                            </p>

                        </div>


                        <div class="info-card">

                            <p class="info-title">
                                Delivery Address
                            </p>

                            <p class="info-text">
                                ${escapeHTML(fullAddress || "N/A")}
                            </p>

                        </div>

                    </div>


                    <!-- PRODUCTS -->
                    <h3 class="items-title">
                        Order Items
                    </h3>

                    <table>

                        <thead>

                            <tr>
                                <th>
                                    Item
                                </th>

                                <th class="center">
                                    Qty
                                </th>

                                <th class="right">
                                    Price
                                </th>

                                <th class="right">
                                    Amount
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            ${(order.orderItems || [])
                    .map((item) => {

                        const quantity =
                            Number(item.quantity || 0);

                        const price =
                            Number(item.price || 0);

                        const amount =
                            price * quantity;

                        return `
                                            <tr>

                                                <td>
                                                    <span class="product-name">
                                                        ${escapeHTML(
                            item.product?.name ||
                            "Product"
                        )}
                                                    </span>
                                                </td>

                                                <td class="center">
                                                    ${quantity}
                                                </td>

                                                <td class="right">
                                                    ₹${price.toFixed(2)}
                                                </td>

                                                <td class="right">
                                                    ₹${amount.toFixed(2)}
                                                </td>

                                            </tr>
                                        `;
                    })
                    .join("")
                }

                        </tbody>

                    </table>


                    <!-- PAYMENT -->
                    <div class="payment-box">

                        <p class="payment-label">
                            Payment Method
                        </p>

                        <p class="payment-value">
                            ${escapeHTML(
                    order.paymentMethod || "Cash on Delivery"
                )}
                        </p>

                    </div>


                    <!-- SUMMARY -->
                    <div class="summary-wrapper">

                        <div class="summary">

                            <div class="summary-row">
                                <span>
                                    Subtotal
                                </span>

                                <span>
                                    ₹${productSubtotal.toFixed(2)}
                                </span>
                            </div>

                            <div class="summary-row">
                                <span>
                                    Delivery Fee
                                </span>

                                <span>
                                    ₹${deliveryFee.toFixed(2)}
                                </span>
                            </div>

                            <div class="summary-total">

                                <span>
                                    Total Paid
                                </span>

                                <span>
                                    ₹${totalPaid.toFixed(2)}
                                </span>

                            </div>

                        </div>

                    </div>


                    <!-- FOOTER -->
                    <div class="footer">

                        <p class="footer-title">
                            Thank you for shopping with us!
                        </p>

                        <p class="footer-text">
                            We appreciate your order and hope to serve you again.
                        </p>

                        <p class="footer-text">
                            This is a computer-generated invoice.
                        </p>

                    </div>

                </div>
            </body>
            </html>
        `;

            /*
             * Create a completely isolated iframe.
             *
             * Important:
             * We do NOT append the invoice directly to the application's
             * document. This prevents Tailwind/OKLCH styles from being
             * inherited by html2canvas.
             */
            const iframe = document.createElement("iframe");

            iframe.style.position = "fixed";
            iframe.style.left = "-100000px";
            iframe.style.top = "0";
            iframe.style.width = "850px";
            iframe.style.height = "1200px";
            iframe.style.border = "0";
            iframe.style.visibility = "hidden";

            document.body.appendChild(iframe);

            const iframeDocument =
                iframe.contentDocument ||
                iframe.contentWindow?.document;

            if (!iframeDocument) {
                throw new Error("Unable to create invoice document.");
            }

            iframeDocument.open();
            iframeDocument.write(invoiceHTML);
            iframeDocument.close();

            /*
             * Wait for the iframe to finish rendering.
             */
            await new Promise((resolve) => {
                setTimeout(resolve, 500);
            });

            /*
             * Wait for invoice images if any.
             */
            const images = Array.from(
                iframeDocument.images
            );

            await Promise.all(
                images.map(
                    (img) =>
                        new Promise((resolve) => {

                            if (img.complete) {
                                resolve();
                                return;
                            }

                            img.onload = resolve;
                            img.onerror = resolve;
                        })
                )
            );

            const invoiceElement =
                iframeDocument.querySelector(".invoice");

            if (!invoiceElement) {
                throw new Error("Invoice element not found.");
            }

            /*
             * Render isolated invoice.
             */
            const canvas = await html2canvas(
                invoiceElement,
                {
                    scale: 2,
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                }
            );

            const imgData =
                canvas.toDataURL("image/png");

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            const pageHeight =
                pdf.internal.pageSize.getHeight();

            const margin = 8;

            const usableWidth =
                pageWidth - margin * 2;

            const imgHeight =
                (canvas.height * usableWidth) /
                canvas.width;

            let heightLeft = imgHeight;
            let position = margin;

            /*
             * First page.
             */
            pdf.addImage(
                imgData,
                "PNG",
                margin,
                position,
                usableWidth,
                imgHeight
            );

            heightLeft -=
                pageHeight - margin * 2;

            /*
             * Additional pages.
             */
            while (heightLeft > 0) {

                pdf.addPage();

                position =
                    margin -
                    (imgHeight - heightLeft);

                pdf.addImage(
                    imgData,
                    "PNG",
                    margin,
                    position,
                    usableWidth,
                    imgHeight
                );

                heightLeft -=
                    pageHeight - margin * 2;
            }

            pdf.save(
                `Invoice_${invoiceNumber}.pdf`
            );

            toast.success(
                "Customer invoice downloaded!",
                {
                    id: "invoice-pdf",
                }
            );

            iframe.remove();

        } catch (error) {

            console.error(
                "INVOICE PDF ERROR:",
                error
            );

            toast.error(
                "Failed to generate invoice.",
                {
                    id: "invoice-pdf",
                }
            );
        }
    };


    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    // Helper to highlight the last 4 digits of the order ID
    const HighlightOrderId = ({ id }) => {
        if (!id) return null;
        const start = id.slice(0, -4);
        const end = id.slice(-4);
        return (
            <div className="flex items-center text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit border border-gray-200 mb-3 shadow-sm">
                <span>#{start}</span>
                <span className="text-indigo-700 font-bold text-base tracking-widest bg-indigo-100 px-1 rounded ml-[1px]">
                    {end}
                </span>
            </div>
        );
    }

    if (loading) return <Loading />

    return (
        <>

            <div className="hidden">
                <button onClick={() => audioRef.current?.play().then(() => audioRef.current.pause())}>
                    Enable Notifications
                </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <h1 className="text-3xl text-slate-700 font-semibold">Store New Orders</h1>
            </div>



            {activeOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No new active orders at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-5 max-w-5xl">
                    {activeOrders.map((order) => {
                        const finances = getOrderFinances(order, commission);
                        return (
                            <div
                                key={order.id}
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setIsModalOpen(true);
                                }}
                                className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition cursor-pointer border-l-4 border-indigo-500"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-lg font-medium">{order.user?.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${order.status === "DELIVERED" ? "bg-green-100 text-green-800"
                                            : order.status === "CANCELLED" ? "bg-red-100 text-red-800"
                                                : order.status === "RETURNED" ? "bg-orange-100 text-orange-800"
                                                    : order.status === "DRIVER_ASSIGNED" ? "bg-blue-100 text-blue-800"
                                                        : "bg-yellow-100 text-yellow-800"}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Inserted Highlighted Order ID here */}
                                <HighlightOrderId id={order.id} />

                                <div className="grid grid-cols-2 gap-3 text-gray-600 text-sm mt-4">
                                    <div><b className="text-gray-800">Your Earnings:</b> <span className="text-emerald-600 font-semibold">₹{finances.sellerEarnings.toFixed(2)}</span></div>
                                    <div><b className="text-gray-800">Payment:</b> {order.paymentMethod}</div>
                                    <div><b className="text-gray-800">Date:</b> {new Date(order.createdAt).toLocaleString()}</div>
                                    <div><b className="text-gray-800">Customer Paid:</b> ₹{order.total}</div>
                                </div>

                                <div className="flex gap-2 mt-4 items-center">
                                    {order.status !== "CANCELLED" && (
                                        <select
                                            value={order.status}
                                            disabled={
                                                order.status === "DELIVERED" ||
                                                order.status === "RETURNED" ||
                                                order.status === "CANCELLED" ||
                                                !SELLER_STATUSES.includes(order.status)
                                            }
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => updateOrderStatus(order, e.target.value)}
                                            className="border rounded px-3 py-1 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                                        >
                                            {SELLER_STATUSES.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    )}

                                    {![
                                        "DRIVER_ASSIGNED", "REACHED_SHOP", "PICKED_UP",
                                        "OUT_FOR_DELIVERY", "DELIVERY_INITIATED",
                                        "DELIVERED", "CANCELLED"
                                    ].includes(order.status) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); cancelOrder(order) }}
                                                className="px-3 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                        )}

                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadInvoicePDF(order) }}
                                        className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded text-sm font-medium transition"
                                    >
                                        Customer Invoice
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}


            {/* ================= MODAL ================= */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Order Finances & Details</h2>
                            <HighlightOrderId id={selectedOrder.id} />
                        </div>

                        {/* FINANCIAL BREAKDOWN */}
                        {(() => {
                            const stats = getOrderFinances(selectedOrder);
                            return (
                                <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
                                    <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">Payout Breakdown</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-slate-600">
                                            <span>Product Total</span>
                                            <span>₹{stats.productTotal?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-red-500">
                                            <span>Platform Commission ({commission}%)</span>
                                            <span>- ₹{stats.platformFee?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400 border-b pb-3">
                                            <span>Delivery Fee (Paid by Customer)</span>
                                            <span>₹{stats.deliveryFee?.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-emerald-600 pt-1">
                                            <span>Your Net Earnings</span>
                                            <span>₹{stats.sellerEarnings?.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* CUSTOMER INFO */}
                        <div className="bg-white border rounded-xl p-5 mb-6">
                            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">Customer Details</h3>
                            <div className="text-sm space-y-2 text-slate-700">
                                <p><b>Name:</b> {selectedOrder.user?.name}</p>
                                <p><b>Email:</b> {selectedOrder.user?.email}</p>
                                <p><b>Phone:</b> {selectedOrder.address?.phone || "N/A"}</p>
                                <p>
                                    <b>Address:</b>{" "}
                                    {selectedOrder.address
                                        ? `${selectedOrder.address.street}, ${selectedOrder.address.city}, ${selectedOrder.address.state}, ${selectedOrder.address.zip}, ${selectedOrder.address.country}`
                                        : "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* PRODUCTS */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">Ordered Items</h3>
                            {selectedOrder?.orderItems?.map((item, i) => (
                                <div key={i} className="flex gap-4 border p-3 rounded-xl bg-white">
                                    <img src={item.product?.images?.[0]?.src || item.product?.images?.[0]} className="w-16 h-16 object-cover rounded-lg border" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{item.product?.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                            <button onClick={() => downloadInvoicePDF(selectedOrder)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">
                                Download Customer Invoice
                            </button>
                            <button onClick={closeModal} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}