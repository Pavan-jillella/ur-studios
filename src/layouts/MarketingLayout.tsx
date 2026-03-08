import { Outlet } from "react-router-dom";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";

const MarketingLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <Outlet />
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
