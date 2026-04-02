import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  Users,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Tag,
  ChevronRight,
  X,
  UserPlus,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MOCK_CLIENTS, MOCK_PROJECTS, type MockClient } from "@/lib/mockData";

// ─── Tag colors ──────────────────────
const TAG_COLORS: Record<string, string> = {
  Wedding: "bg-pink-100 text-pink-700 border-pink-200",
  Portrait: "bg-blue-100 text-blue-700 border-blue-200",
  Brand: "bg-purple-100 text-purple-700 border-purple-200",
  Events: "bg-amber-100 text-amber-700 border-amber-200",
  Commercial: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Engagement: "bg-rose-100 text-rose-700 border-rose-200",
};

const ALL_TAGS = ["Wedding", "Portrait", "Brand", "Events", "Commercial", "Engagement"];

type SortField = "name" | "totalSpent" | "joinedAt" | "projectCount";
type SortDir = "asc" | "desc";

// ─── Client Row ──────────────────────
function ClientRow({
  client,
  index,
  onClick,
}: {
  client: MockClient;
  index: number;
  onClick: () => void;
}) {
  const projectCount = MOCK_PROJECTS.filter((p) => p.clientId === client.id).length;
  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <div
        className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/40 cursor-pointer transition-all duration-200"
        onClick={onClick}
      >
        {/* Avatar */}
        <div
          className="h-11 w-11 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-semibold font-body shadow-sm"
          style={{ backgroundColor: client.avatarColor }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-body text-sm font-semibold text-foreground truncate">
              {client.name}
            </p>
            <div className="hidden sm:flex items-center gap-1.5">
              {client.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${TAG_COLORS[tag] || ""}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground font-body">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {client.email}
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {client.phone}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden lg:flex items-center gap-8 shrink-0 text-sm font-body">
          <div className="text-center">
            <p className="font-semibold text-foreground">
              ${client.totalSpent.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Lifetime
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{projectCount}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Projects
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">
              {new Date(client.joinedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Joined
            </p>
          </div>
        </div>

        {/* Action */}
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
      </div>
    </motion.div>
  );
}

// ─── Add/Edit Client Dialog ──────────────────────
function ClientFormDialog({
  open,
  onOpenChange,
  editClient,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClient: MockClient | null;
  onSave: (client: Partial<MockClient>) => void;
}) {
  const [name, setName] = useState(editClient?.name || "");
  const [email, setEmail] = useState(editClient?.email || "");
  const [phone, setPhone] = useState(editClient?.phone || "");
  const [tags, setTags] = useState<string[]>(editClient?.tags || []);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    onSave({ name, email, phone, tags });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {editClient ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client-name" className="font-body text-sm">
              Full Name *
            </Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah & James Mitchell"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-email" className="font-body text-sm">
              Email *
            </Label>
            <Input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-phone" className="font-body text-sm">
              Phone
            </Label>
            <Input
              id="client-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 234-5678"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body text-sm">Tags</Label>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all border ${
                    tags.includes(tag)
                      ? TAG_COLORS[tag] || "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editClient ? "Save Changes" : "Add Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main CRM Component ──────────────────────
export default function AdminClients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<MockClient[]>(MOCK_CLIENTS);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<MockClient | null>(null);

  // Filtered + sorted clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    // Tag filter
    if (tagFilter !== "all") {
      result = result.filter((c) => c.tags.includes(tagFilter));
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "totalSpent":
          cmp = a.totalSpent - b.totalSpent;
          break;
        case "joinedAt":
          cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case "projectCount":
          cmp = a.projectCount - b.projectCount;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [clients, search, tagFilter, sortField, sortDir]);

  // Stats
  const totalClients = clients.length;
  const totalCLV = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgCLV = totalClients > 0 ? Math.round(totalCLV / totalClients) : 0;
  const newThisMonth = clients.filter((c) => {
    const joined = new Date(c.joinedAt);
    const now = new Date();
    return joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear();
  }).length;

  const handleAddClient = (data: Partial<MockClient>) => {
    const AVATAR_COLORS = [
      "hsl(35, 60%, 55%)", "hsl(200, 55%, 50%)", "hsl(160, 45%, 48%)",
      "hsl(280, 45%, 55%)", "hsl(350, 55%, 55%)",
    ];
    const newClient: MockClient = {
      id: `c${Date.now()}`,
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      tags: data.tags || [],
      totalSpent: 0,
      projectCount: 0,
      joinedAt: new Date().toISOString().split("T")[0],
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    };
    setClients((prev) => [newClient, ...prev]);
    toast.success("Client added successfully");
  };

  const handleEditClient = (data: Partial<MockClient>) => {
    if (!editingClient) return;
    setClients((prev) =>
      prev.map((c) => (c.id === editingClient.id ? { ...c, ...data } : c))
    );
    setEditingClient(null);
    toast.success("Client updated");
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Clients</h1>
          <p className="font-body text-muted-foreground mt-1">
            Manage your client relationships
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(null);
            setDialogOpen(true);
          }}
          className="gap-2 shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Add Client
        </Button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-display font-bold">{totalClients}</p>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                Total Clients
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-display font-bold">${totalCLV.toLocaleString()}</p>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                Total CLV
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-display font-bold">${avgCLV.toLocaleString()}</p>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                Avg. CLV
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-display font-bold">{newThisMonth}</p>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                New This Month
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-10 font-body"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[140px] font-body text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {ALL_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("totalSpent")}
            className="gap-1.5 font-body text-xs shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortField === "totalSpent" ? (sortDir === "desc" ? "High → Low" : "Low → High") : "Sort by CLV"}
          </Button>
        </div>
      </motion.div>

      {/* Client List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card>
          <CardContent className="p-2 divide-y divide-border/50">
            {filteredClients.length === 0 ? (
              <div className="text-center py-16">
                <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="font-body text-muted-foreground text-sm">
                  {search || tagFilter !== "all"
                    ? "No clients match your filters"
                    : "No clients yet. Add your first client!"}
                </p>
              </div>
            ) : (
              filteredClients.map((client, index) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  index={index}
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                />
              ))
            )}
          </CardContent>
        </Card>
        {filteredClients.length > 0 && (
          <p className="text-xs font-body text-muted-foreground mt-3 text-center">
            Showing {filteredClients.length} of {clients.length} clients
          </p>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editClient={editingClient}
        onSave={editingClient ? handleEditClient : handleAddClient}
      />
    </div>
  );
}
