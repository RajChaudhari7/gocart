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

export const TIME_FILTERS = [
    {
        label: "Today",
        value: "today",
    },
    {
        label: "Yesterday",
        value: "yesterday",
    },
    {
        label: "Last 7 Days",
        value: "7d",
    },
    {
        label: "Last 30 Days",
        value: "30d",
    },
    {
        label: "Last 90 Days",
        value: "90d",
    },
    {
        label: "This Month",
        value: "thisMonth",
    },
    {
        label: "Last Month",
        value: "lastMonth",
    },
    {
        label: "Last 12 Months",
        value: "12m",
    },
    {
        label: "All Time",
        value: "all",
    },
];

export const SORT_OPTIONS = [
    {
        label: "Best Selling",
        value: "bestSelling",
    },
    {
        label: "Most Viewed",
        value: "mostViewed",
    },
    {
        label: "Highest Gross Revenue",
        value: "grossRevenue",
    },
    {
        label: "Highest Seller Earnings",
        value: "sellerEarnings",
    },
    {
        label: "Highest Rating",
        value: "highestRating",
    },
    {
        label: "Lowest Stock",
        value: "lowestStock",
    },
    {
        label: "Newest Products",
        value: "newest",
    },
    {
        label: "Oldest Products",
        value: "oldest",
    },
];

export const STOCK_FILTERS = [
    {
        label: "All Stock",
        value: "all",
    },
    {
        label: "In Stock",
        value: "inStock",
    },
    {
        label: "Low Stock",
        value: "lowStock",
    },
    {
        label: "Out of Stock",
        value: "outOfStock",
    },
];

export const DEFAULT_ANALYTICS_FILTERS = {
    range: "30d",
    search: "",
    category: "all",
    sort: "bestSelling",
    stock: "all",
    featured: false,
};