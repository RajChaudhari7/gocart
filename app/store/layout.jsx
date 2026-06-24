import SplashWrapper from "@/components/store/SplashWrapper";
import StoreLayout from "@/components/store/StoreLayout";
import { SignedIn, SignedOut, SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Nandurbar Bazar Seller",
  manifest: "/store-manifest.json",

  icons: {
    icon: "/seller-192.png",
    apple: "/seller-192.png"
  },

  appleWebApp: {
    capable: true,
    title: "NB Seller",
    statusBarStyle: "black-translucent"
  }
};

export default function RootAdminLayout({ children }) {
  return (
    <>
      <SignedIn>
        <StoreLayout>
          <SplashWrapper>
            {children}
          </SplashWrapper>
        </StoreLayout>
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <SignIn fallbackRedirectUrl="/store/" routing="hash" />
        </div>
      </SignedOut>
    </>
  );
}