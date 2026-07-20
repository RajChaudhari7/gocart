import {
    Box,
    Eye,
    ShoppingBag,
    Star,
} from "lucide-react";

/* =========================
   KPI Cards
========================= */

export const KPI_CONFIG = [
    {
        key: "totalProducts",
        title: "Total Products",
        description:
            "Active products available in your store",
        icon: Box,
        iconBackground:
            "bg-gradient-to-br from-blue-500 to-cyan-500",
        iconShadow:
            "shadow-blue-500/20",
        glow: "bg-blue-500/10",
    },

    {
        key: "totalViews",
        title: "Total Product Views",
        description:
            "Combined views across all your products",
        icon: Eye,
        iconBackground:
            "bg-gradient-to-br from-violet-500 to-purple-600",
        iconShadow:
            "shadow-violet-500/20",
        glow: "bg-violet-500/10",
    },

    {
        key: "totalSales",
        title: "Total Units Sold",
        description:
            "Total product quantities sold",
        icon: ShoppingBag,
        iconBackground:
            "bg-gradient-to-br from-emerald-500 to-green-600",
        iconShadow:
            "shadow-emerald-500/20",
        glow: "bg-emerald-500/10",
    },

    {
        key: "averageRating",
        title: "Average Rating",
        description:
            "Average customer rating",
        icon: Star,
        iconBackground:
            "bg-gradient-to-br from-yellow-400 to-orange-500",
        iconShadow:
            "shadow-yellow-500/20",
        glow: "bg-yellow-500/10",
        suffix: "/5",
    },
];

/* =========================
   Charts
========================= */

export const PIE_COLORS = [
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6366F1",
    "#EC4899",
    "#14B8A6",
];

export const CHART_COLORS = {
    views: "#8B5CF6",
    sales: "#10B981",
    grossRevenue: "#3B82F6",
    sellerEarnings: "#10B981",
    commission: "#F59E0B",
};



/* =========================
   Table
========================= */

export const SORTABLE_COLUMNS = [
    {
        key: "rank",
        label: "Rank",
    },

    {
        key: "name",
        label: "Product",
    },

    {
        key: "views",
        label: "Views",
    },

    {
        key: "sold",
        label: "Units Sold",
    },

    {
        key: "rating",
        label: "Rating",
    },

    {
        key: "stock",
        label: "Stock",
    },

    {
        key: "grossRevenue",
        label: "Gross Revenue",
    },

    {
        key: "commission",
        label: "Commission",
    },

    {
        key: "sellerEarnings",
        label: "Seller Earnings",
    },
];

/* =========================
   Stock Thresholds
========================= */

export const STOCK_LIMITS = {
    LOW_STOCK: 10,
    OUT_OF_STOCK: 0,
};

export const ERROR_STATE = {
    title: "Something went wrong",

    defaultMessage:
        "Unable to load product analytics.",

    retryText: "Try Again",

    retryingText: "Retrying...",
};


/* =========================
   Empty State Messages
========================= */

export const EMPTY_MESSAGES = {
    chartTitle: "No Analytics Available",

    chartDescription:
        "Analytics will appear once your products receive views and sales.",

    tableTitle: "No Product Analytics Yet",

    tableDescription:
        "Your top-performing products will appear here after customers start purchasing products.",
};