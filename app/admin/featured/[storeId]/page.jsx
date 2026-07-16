import FeaturedProductsTable from "@/components/admin/FeaturedProductsTable";

export default async function Page({ params }) {

    return (

        <div className="p-6">

            <FeaturedProductsTable
                storeId={params.storeId}
            />

        </div>

    );

}