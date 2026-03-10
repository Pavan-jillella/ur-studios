import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Portfolio from "./pages/Portfolio";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ServiceDetail from "./pages/ServiceDetail";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

import AdminLayout from "./components/admin/AdminLayout";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminPortfolio from "./pages/admin/AdminPortfolio";
import AdminServices from "./pages/admin/AdminServices";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminAlbumDetail from "./pages/admin/AdminAlbumDetail";

import PortalLayout from "./components/portal/PortalLayout";
import PortalBookings from "./pages/portal/PortalBookings";
import PortalGallery from "./pages/portal/PortalGallery";
import PortalDownloads from "./pages/portal/PortalDownloads";

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminBookings />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/portfolio" element={<AdminPortfolio />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/testimonials" element={<AdminTestimonials />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
              <Route path="/admin/blog/:id" element={<AdminBlogEditor />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/gallery/:id" element={<AdminAlbumDetail />} />
            </Route>
          </Route>

          {/* Client Portal Routes */}
          <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
            <Route element={<PortalLayout />}>
              <Route path="/portal" element={<PortalBookings />} />
              <Route path="/portal/bookings" element={<PortalBookings />} />
              <Route path="/portal/gallery" element={<PortalGallery />} />
              <Route path="/portal/downloads" element={<PortalDownloads />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
