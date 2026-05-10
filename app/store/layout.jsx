import StoreLayout from "@/components/store/StoreLayout";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Nandurbar Bazar Seller",
  description: "Seller Dashboard",

  manifest: "/store-manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NB Seller",
  },

  icons: {
    icon: "/seller-192.png",
    apple: "/seller-192.png",
  },
};


export default function RootAdminLayout({ children }) {
  return (
    <>
      <SignedIn>
        <StoreLayout>
          {children}
        </StoreLayout>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <SignIn fallbackRedirectUrl="/store" routing="hash" />
        </div>
      </SignedOut>
    </>
  );
}