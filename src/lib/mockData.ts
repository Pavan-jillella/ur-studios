/**
 * Mock data store for local development when Supabase is not configured.
 * All data lives in memory and resets on page refresh.
 * When Supabase env vars are set, real API calls will be used instead.
 */

export interface MockClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  totalSpent: number;
  projectCount: number;
  joinedAt: string;
  avatarColor: string;
}

export interface MockProject {
  id: string;
  clientName: string;
  clientId: string;
  serviceType: string;
  status: "draft" | "shooting" | "editing" | "delivered";
  eventDate: string;
  location: string;
  paymentStatus: "unpaid" | "paid" | "partial";
  amount: number;
  createdAt: string;
}

export interface MockInvoice {
  id: string;
  clientName: string;
  projectId: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paidAt: string | null;
}

export interface MockNotification {
  id: string;
  type: "booking" | "payment" | "gallery" | "favorite";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MockGalleryStats {
  albumId: string;
  albumTitle: string;
  clientName: string;
  totalPhotos: number;
  favorites: number;
  status: "draft" | "proofing" | "delivered";
}

// ─── Avatar color helpers ──────────────────────
const AVATAR_COLORS = [
  "hsl(35, 60%, 55%)",
  "hsl(200, 55%, 50%)",
  "hsl(160, 45%, 48%)",
  "hsl(280, 45%, 55%)",
  "hsl(350, 55%, 55%)",
  "hsl(45, 60%, 50%)",
  "hsl(190, 50%, 45%)",
  "hsl(320, 45%, 50%)",
];

// ─── Mock Clients ──────────────────────
export const MOCK_CLIENTS: MockClient[] = [
  {
    id: "c1",
    name: "Sarah & James Mitchell",
    email: "sarah.mitchell@gmail.com",
    phone: "(555) 234-5678",
    tags: ["Wedding"],
    totalSpent: 4500,
    projectCount: 2,
    joinedAt: "2025-11-15",
    avatarColor: AVATAR_COLORS[0],
  },
  {
    id: "c2",
    name: "Priya Sharma",
    email: "priya.sharma@outlook.com",
    phone: "(555) 345-6789",
    tags: ["Portrait", "Brand"],
    totalSpent: 2200,
    projectCount: 3,
    joinedAt: "2025-08-20",
    avatarColor: AVATAR_COLORS[1],
  },
  {
    id: "c3",
    name: "Michael & Lisa Chen",
    email: "m.chen@email.com",
    phone: "(555) 456-7890",
    tags: ["Wedding", "Engagement"],
    totalSpent: 6800,
    projectCount: 3,
    joinedAt: "2025-06-10",
    avatarColor: AVATAR_COLORS[2],
  },
  {
    id: "c4",
    name: "David Thompson",
    email: "david.t@company.co",
    phone: "(555) 567-8901",
    tags: ["Commercial", "Events"],
    totalSpent: 3200,
    projectCount: 4,
    joinedAt: "2025-09-05",
    avatarColor: AVATAR_COLORS[3],
  },
  {
    id: "c5",
    name: "Emma Rodriguez",
    email: "emma.r@gmail.com",
    phone: "(555) 678-9012",
    tags: ["Portrait"],
    totalSpent: 850,
    projectCount: 1,
    joinedAt: "2026-01-20",
    avatarColor: AVATAR_COLORS[4],
  },
  {
    id: "c6",
    name: "Alex & Jordan Park",
    email: "parkwedding@gmail.com",
    phone: "(555) 789-0123",
    tags: ["Wedding"],
    totalSpent: 5200,
    projectCount: 2,
    joinedAt: "2026-02-01",
    avatarColor: AVATAR_COLORS[5],
  },
  {
    id: "c7",
    name: "Renovation Co.",
    email: "media@renovationco.com",
    phone: "(555) 890-1234",
    tags: ["Commercial"],
    totalSpent: 1800,
    projectCount: 2,
    joinedAt: "2025-12-10",
    avatarColor: AVATAR_COLORS[6],
  },
  {
    id: "c8",
    name: "Nina Patel",
    email: "nina.p@icloud.com",
    phone: "(555) 901-2345",
    tags: ["Portrait", "Events"],
    totalSpent: 1500,
    projectCount: 2,
    joinedAt: "2026-03-01",
    avatarColor: AVATAR_COLORS[7],
  },
];

// ─── Mock Projects ──────────────────────
export const MOCK_PROJECTS: MockProject[] = [
  {
    id: "p1",
    clientName: "Sarah & James Mitchell",
    clientId: "c1",
    serviceType: "Wedding Photography",
    status: "delivered",
    eventDate: "2026-02-14",
    location: "The Grand Estate, Austin TX",
    paymentStatus: "paid",
    amount: 3500,
    createdAt: "2025-12-01",
  },
  {
    id: "p2",
    clientName: "Priya Sharma",
    clientId: "c2",
    serviceType: "Brand Photography",
    status: "editing",
    eventDate: "2026-03-20",
    location: "Downtown Studio",
    paymentStatus: "paid",
    amount: 1200,
    createdAt: "2026-02-15",
  },
  {
    id: "p3",
    clientName: "Michael & Lisa Chen",
    clientId: "c3",
    serviceType: "Engagement Session",
    status: "delivered",
    eventDate: "2026-01-28",
    location: "Central Park, NYC",
    paymentStatus: "paid",
    amount: 2800,
    createdAt: "2025-11-20",
  },
  {
    id: "p4",
    clientName: "Alex & Jordan Park",
    clientId: "c6",
    serviceType: "Wedding Photography",
    status: "shooting",
    eventDate: "2026-04-15",
    location: "Oceanview Venue",
    paymentStatus: "partial",
    amount: 4200,
    createdAt: "2026-01-10",
  },
  {
    id: "p5",
    clientName: "David Thompson",
    clientId: "c4",
    serviceType: "Corporate Event",
    status: "draft",
    eventDate: "2026-05-10",
    location: "Thompson Corp HQ",
    paymentStatus: "unpaid",
    amount: 1800,
    createdAt: "2026-03-15",
  },
  {
    id: "p6",
    clientName: "Emma Rodriguez",
    clientId: "c5",
    serviceType: "Portrait Session",
    status: "editing",
    eventDate: "2026-03-25",
    location: "Sunrise Gardens",
    paymentStatus: "paid",
    amount: 850,
    createdAt: "2026-02-20",
  },
  {
    id: "p7",
    clientName: "Nina Patel",
    clientId: "c8",
    serviceType: "Birthday Party",
    status: "shooting",
    eventDate: "2026-04-05",
    location: "Ruby Hall",
    paymentStatus: "unpaid",
    amount: 950,
    createdAt: "2026-03-10",
  },
  {
    id: "p8",
    clientName: "Michael & Lisa Chen",
    clientId: "c3",
    serviceType: "Wedding Photography",
    status: "draft",
    eventDate: "2026-06-20",
    location: "Vineyard Estate",
    paymentStatus: "unpaid",
    amount: 4000,
    createdAt: "2026-03-01",
  },
];

// ─── Mock Invoices ──────────────────────
export const MOCK_INVOICES: MockInvoice[] = [
  { id: "inv1", clientName: "Sarah & James Mitchell", projectId: "p1", amount: 3500, status: "paid", dueDate: "2026-01-14", paidAt: "2026-01-10" },
  { id: "inv2", clientName: "Priya Sharma", projectId: "p2", amount: 1200, status: "paid", dueDate: "2026-03-01", paidAt: "2026-02-28" },
  { id: "inv3", clientName: "Michael & Lisa Chen", projectId: "p3", amount: 2800, status: "paid", dueDate: "2026-01-15", paidAt: "2026-01-12" },
  { id: "inv4", clientName: "Alex & Jordan Park", projectId: "p4", amount: 2100, status: "pending", dueDate: "2026-04-01", paidAt: null },
  { id: "inv5", clientName: "David Thompson", projectId: "p5", amount: 1800, status: "overdue", dueDate: "2026-03-20", paidAt: null },
  { id: "inv6", clientName: "Emma Rodriguez", projectId: "p6", amount: 850, status: "paid", dueDate: "2026-03-10", paidAt: "2026-03-08" },
  { id: "inv7", clientName: "Nina Patel", projectId: "p7", amount: 950, status: "pending", dueDate: "2026-04-15", paidAt: null },
  { id: "inv8", clientName: "Michael & Lisa Chen", projectId: "p8", amount: 4000, status: "pending", dueDate: "2026-05-01", paidAt: null },
];

// ─── Mock Notifications ──────────────────────
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: "n1", type: "booking", title: "New Booking Request", message: "Nina Patel requested a Birthday Party shoot", timestamp: "2026-03-31T14:30:00", read: false },
  { id: "n2", type: "payment", title: "Payment Received", message: "Emma Rodriguez paid $850 for Portrait Session", timestamp: "2026-03-30T09:15:00", read: false },
  { id: "n3", type: "favorite", title: "Client Favorites", message: "Sarah Mitchell selected 24 favorites from Wedding album", timestamp: "2026-03-29T18:00:00", read: true },
  { id: "n4", type: "gallery", title: "Gallery Viewed", message: "Michael Chen viewed the Engagement album", timestamp: "2026-03-28T11:45:00", read: true },
  { id: "n5", type: "booking", title: "Booking Confirmed", message: "Alex & Jordan Park confirmed Wedding on Apr 15", timestamp: "2026-03-27T16:20:00", read: true },
];

// ─── Mock Gallery Stats ──────────────────────
export const MOCK_GALLERY_STATS: MockGalleryStats[] = [
  { albumId: "g1", albumTitle: "Mitchell Wedding", clientName: "Sarah & James Mitchell", totalPhotos: 342, favorites: 87, status: "delivered" },
  { albumId: "g2", albumTitle: "Priya – Brand Shoot", clientName: "Priya Sharma", totalPhotos: 156, favorites: 0, status: "proofing" },
  { albumId: "g3", albumTitle: "Chen Engagement", clientName: "Michael & Lisa Chen", totalPhotos: 210, favorites: 64, status: "delivered" },
  { albumId: "g4", albumTitle: "Park Pre-Wedding", clientName: "Alex & Jordan Park", totalPhotos: 89, favorites: 22, status: "proofing" },
  { albumId: "g5", albumTitle: "Emma – Portraits", clientName: "Emma Rodriguez", totalPhotos: 78, favorites: 0, status: "draft" },
];

// ─── Revenue history (monthly) ──────────────────────
export const MOCK_REVENUE_HISTORY = [
  { month: "Oct", revenue: 3200 },
  { month: "Nov", revenue: 5800 },
  { month: "Dec", revenue: 4100 },
  { month: "Jan", revenue: 6300 },
  { month: "Feb", revenue: 4450 },
  { month: "Mar", revenue: 8350 },
];

// ─── Bookings by service ──────────────────────
export const MOCK_SERVICE_BREAKDOWN = [
  { name: "Wedding", count: 4, color: "hsl(35, 60%, 55%)" },
  { name: "Portrait", count: 3, color: "hsl(200, 55%, 50%)" },
  { name: "Events", count: 2, color: "hsl(160, 45%, 48%)" },
  { name: "Commercial", count: 2, color: "hsl(280, 45%, 55%)" },
  { name: "Engagement", count: 1, color: "hsl(350, 55%, 55%)" },
];

// ─── Computed Dashboard Stats ──────────────────────
export function getDashboardStats() {
  const totalRevenue = MOCK_INVOICES
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const activeClients = MOCK_CLIENTS.length;

  const upcomingShoots = MOCK_PROJECTS.filter(
    (p) => p.status === "draft" || p.status === "shooting"
  ).length;

  const pendingPayments = MOCK_INVOICES.filter(
    (p) => p.status === "pending" || p.status === "overdue"
  ).length;

  const deliveredProjects = MOCK_PROJECTS.filter(
    (p) => p.status === "delivered"
  ).length;

  const overdueAmount = MOCK_INVOICES
    .filter((i) => i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    totalRevenue,
    activeClients,
    upcomingShoots,
    pendingPayments,
    deliveredProjects,
    overdueAmount,
  };
}

// ─── Client Portal Mock Data ──────────────────────
export function getClientPortalData() {
  return {
    greeting: "Test Client",
    totalPhotos: 342,
    favoritesCount: 87,
    deliveryStatus: "delivered" as const,
    upcomingSession: {
      service: "Portrait Re-shoot",
      date: "2026-04-20",
      location: "Downtown Studio",
      time: "10:00 AM",
    },
    recentGalleries: [
      {
        id: "g1",
        title: "Wedding Gallery",
        coverUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
        photoCount: 342,
        favorites: 87,
        status: "delivered" as const,
      },
      {
        id: "g2",
        title: "Engagement Session",
        coverUrl: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80",
        photoCount: 210,
        favorites: 64,
        status: "delivered" as const,
      },
      {
        id: "g3",
        title: "Pre-Wedding Shoot",
        coverUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80",
        photoCount: 89,
        favorites: 22,
        status: "proofing" as const,
      },
    ],
    recentPayments: [
      { id: "pay1", description: "Wedding Photography", amount: 3500, status: "paid" as const, date: "2026-01-10" },
      { id: "pay2", description: "Engagement Session", amount: 2800, status: "paid" as const, date: "2026-01-12" },
      { id: "pay3", description: "Portrait Session – Deposit", amount: 400, status: "pending" as const, date: "2026-04-01" },
    ],
  };
}
