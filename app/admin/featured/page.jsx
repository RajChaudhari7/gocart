import FeaturedStoresTable from "@/components/admin/FeaturedStoresTable";

export default function FeaturedPage() {

    return (

        <div className="p-6">

            <div className="mb-8">

                <h1 className="text-3xl font-black text-slate-800">

                    Featured Products

                </h1>

                <p className="text-slate-500 mt-2">

                    Choose products that should appear on the homepage.

                </p>

            </div>

            <FeaturedStoresTable />

        </div>

    );

}