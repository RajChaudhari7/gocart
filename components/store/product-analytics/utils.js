export const toNumber = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
};

export const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
        toNumber(value)
    );
};

export const formatCompactNumber = (value) => {
    return new Intl.NumberFormat("en-IN", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(toNumber(value));
};

export const formatCurrency = (
    value,
    options = {}
) => {
    const {
        maximumFractionDigits = 0,
        minimumFractionDigits = 0,
        compact = false,
    } = options;

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        notation: compact
            ? "compact"
            : "standard",
        maximumFractionDigits,
        minimumFractionDigits,
    }).format(toNumber(value));
};

export const formatCurrencyAxis = (value) => {
    const amount = toNumber(value);

    return new Intl.NumberFormat("en-IN", {
        notation:
            Math.abs(amount) >= 10000
                ? "compact"
                : "standard",
        maximumFractionDigits: 1,
    }).format(amount);
};

export const formatPercentage = (
    value,
    digits = 1
) => {
    return `${toNumber(value).toFixed(
        digits
    )}%`;
};

export const calculateConversionRate = (
    sales,
    views,
    digits = 2
) => {
    const totalSales = toNumber(sales);
    const totalViews = toNumber(views);

    if (totalViews <= 0) {
        return Number(0).toFixed(digits);
    }

    return (
        (totalSales / totalViews) *
        100
    ).toFixed(digits);
};

export const truncateText = (
    value,
    maxLength = 15
) => {
    const text = String(value || "");

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(
        0,
        maxLength
    )}...`;
};

export const getStockDetails = (stock) => {
    const quantity = toNumber(stock);

    if (quantity <= 0) {
        return {
            label: "Out of Stock",
            status: "outOfStock",
            className:
                "border-red-500/20 bg-red-500/10 text-red-300",
            dotClassName: "bg-red-400",
        };
    }

    if (quantity < 10) {
        return {
            label: "Low Stock",
            status: "lowStock",
            className:
                "border-amber-500/20 bg-amber-500/10 text-amber-300",
            dotClassName: "bg-amber-400",
        };
    }

    return {
        label: "In Stock",
        status: "inStock",
        className:
            "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        dotClassName: "bg-emerald-400",
    };
};

export const getRankStyle = (rank) => {
    const position = toNumber(rank);

    if (position === 1) {
        return {
            type: "gold",
            container:
                "border-amber-400/30 bg-amber-400/10 text-amber-300",
        };
    }

    if (position === 2) {
        return {
            type: "silver",
            container:
                "border-slate-300/20 bg-slate-300/10 text-slate-200",
        };
    }

    if (position === 3) {
        return {
            type: "bronze",
            container:
                "border-orange-500/20 bg-orange-500/10 text-orange-300",
        };
    }

    return {
        type: "default",
        container:
            "border-slate-700 bg-slate-800 text-slate-300",
    };
};

export const normalizeViewsVsSalesData = (
    data = []
) => {
    return data.map((item) => ({
        id: item.id || null,

        name:
            item.name ||
            item.productName ||
            "Unnamed Product",

        views: toNumber(
            item.views ??
            item.totalViews
        ),

        sales: toNumber(
            item.sales ??
            item.totalSales ??
            item.unitsSold
        ),
    }));
};

export const normalizeSalesByCategoryData = (
    data = []
) => {
    const normalized = data.map(
        (item) => ({
            name:
                item.name ||
                item.category ||
                "Unknown",

            sales: toNumber(
                item.sales ??
                item.value
            ),
        })
    );

    const totalSales = normalized.reduce(
        (sum, item) =>
            sum + item.sales,
        0
    );

    return normalized.map((item) => ({
        ...item,

        percentage:
            totalSales > 0
                ? Number(
                    (
                        (item.sales /
                            totalSales) *
                        100
                    ).toFixed(1)
                )
                : 0,
    }));
};

export const normalizeMonthlySalesData = (
    data = []
) => {
    return data.map((item) => ({
        month:
            item.month ||
            item.name ||
            "",

        sales: toNumber(
            item.sales ??
            item.sellerEarnings ??
            item.revenue
        ),

        grossRevenue: toNumber(
            item.grossRevenue
        ),

        commissionAmount: toNumber(
            item.commissionAmount ??
            item.commission
        ),

        sellerEarnings: toNumber(
            item.sellerEarnings ??
            item.revenue ??
            item.sales
        ),

        orders: toNumber(
            item.orders ??
            item.totalOrders
        ),
    }));
};

export const normalizeTopProductSalesData = (
    data = []
) => {
    return data
        .map((item) => ({
            id: item.id || null,

            name:
                item.name ||
                item.productName ||
                "Unnamed Product",

            sales: toNumber(
                item.sales ??
                item.totalSales ??
                item.unitsSold
            ),

            grossRevenue: toNumber(
                item.grossRevenue ??
                item.revenue
            ),

            commissionAmount: toNumber(
                item.commissionAmount ??
                item.commission
            ),

            sellerEarnings: toNumber(
                item.sellerEarnings ??
                item.revenue
            ),
        }))
        .sort(
            (first, second) =>
                second.sellerEarnings -
                first.sellerEarnings
        )
        .slice(0, 10);
};

export const normalizeTopProducts = (
    products = []
) => {
    return products.map(
        (product, index) => ({
            rank: toNumber(
                product.rank,
                index + 1
            ),

            id:
                product.id ||
                `${product.name}-${index}`,

            name:
                product.name ||
                "Unnamed Product",

            image:
                product.image ||
                product.images?.[0] ||
                null,

            category:
                product.category ||
                "Uncategorized",

            sold: toNumber(
                product.sold ??
                product.unitsSold
            ),

            views: toNumber(
                product.views ??
                product.totalViews
            ),

            stock: toNumber(
                product.stock ??
                product.quantity
            ),

            rating: toNumber(
                product.rating ??
                product.averageRating
            ),

            price: toNumber(
                product.price
            ),

            mrp: toNumber(product.mrp),

            featured: Boolean(
                product.featured
            ),

            grossRevenue: toNumber(
                product.grossRevenue
            ),

            commission: toNumber(
                product.commission ??
                product.commissionAmount
            ),

            sellerEarnings: toNumber(
                product.sellerEarnings
            ),
        })
    );
};                 