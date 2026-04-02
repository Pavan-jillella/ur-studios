import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded routes — only downloaded when visited
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminPortfolio = lazy(() => import("./pages/admin/AdminPortfolio"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogEditor = lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminAlbumDetail = lazy(() => import("./pages/admin/AdminAlbumDetail"));
const AdminProofingQueue = lazy(() => import("./pages/admin/AdminProofingQueue"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminClientProfile = lazy(() => import("./pages/admin/AdminClientProfile"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));

const PortalLayout = lazy(() => import("./components/portal/PortalLayout"));
const PortalLanding = lazy(() => import("./pages/portal/PortalLanding"));
const PortalBookings = lazy(() => import("./pages/portal/PortalBookings"));
const PortalGallery = lazy(() => import("./pages/portal/PortalGallery"));
const PortalDownloads = lazy(() => import("./pages/portal/PortalDownloads"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/portfolio" element={<AdminPortfolio />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/blog" element={<AdminBlog />} />
                <Route path="/admin/blog/new" element={<AdminBlogEditor />} />
                <Route path="/admin/blog/:id" element={<AdminBlogEditor />} />
                <Route path="/admin/gallery" element={<AdminGallery />} />
                <Route path="/admin/gallery/:id" element={<AdminAlbumDetail />} />
                <Route path="/admin/proofing" element={<AdminProofingQueue />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/clients/:id" element={<AdminClientProfile />} />
                <Route path="/admin/projects" element={<AdminProjects />} />
                <Route path="/admin/invoices" element={<AdminInvoices />} />
                <Route path="/admin/reports" element={<AdminReports />} />
              </Route>
            </Route>

            {/* Client Portal Routes */}
            <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
              <Route element={<PortalLayout />}>
                <Route path="/portal" element={<PortalLanding />} />
                <Route path="/portal/bookings" element={<PortalBookings />} />
                <Route path="/portal/gallery" element={<PortalGallery />} />
                <Route path="/portal/downloads" element={<PortalDownloads />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
