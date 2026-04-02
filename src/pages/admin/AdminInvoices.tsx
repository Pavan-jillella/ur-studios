import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  X,
  Plus,
  Receipt,
  ArrowUpDown,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  MOCK_INVOICES,
  MOCK_CLIENTS,
  MOCK_PROJECTS,
  type MockInvoice,
} from "@/lib/mockData";

// ─── Status config ──────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  paid: { label: "Paid", color: "text-emerald-700", icon: CheckCircle, bgColor: "bg-emerald-50 border-emerald-200" },
  pending: { label: "Pending", color: "text-amber-700", icon: Clock, bgColor: "bg-amber-50 border-amber-200" },
  overdue: { label: "Overdue", color: "text-red-700", icon: AlertCircle, bgColor: "bg-red-50 border-red-200" },
};

// ─── Create Invoice Dialog ──────────────────────
function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (inv: Partial<MockInvoice>) => void;
}) {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const clientProjects = MOCK_PROJECTS.filter((p) => p.clientId === clientId);

  const handleSave = () => {
    if (!clientId || !amount || !dueDate) {
      toast.error("All fields are required");
      return;
    }
    const client = MOCK_CLIENTS.find((c) => c.id === clientId);
    onSave({
      clientName: client?.name || "",
      projectId: clientProjects[0]?.id || "",
      amount: parseFloat(amount),
      status: "pending",
      dueDate,
      paidAt: null,
    });
    setClientId("");
    setAmount("");
    setDueDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="font-body text-sm">Client *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="font-body">
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CLIENTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-amount" className="font-body text-sm">Amount ($) *</Label>
            <Input
              id="inv-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="3,500"
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inv-due" className="font-body text-sm">Due Date *</Label>
            <Input
              id="inv-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="font-body"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Receipt className="h-4 w-4" />
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Invoice Detail Dialog ──────────────────────
function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
  onMarkPaid,
  onSendReminder,
}: {
  invoice: MockInvoice | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onMarkPaid: (id: string) => void;
  onSendReminder: (id: string) => void;
}) {
  if (!invoice) return null;

  const statusCfg = STATUS_CONFIG[invoice.status];
  const StatusIcon = statusCfg.icon;
  const project = MOCK_PROJECTS.find((p) => p.id === invoice.projectId);
  const daysUntilDue = Math.ceil(
    (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            Invoice #{invoice.id.replace("inv", "").padStart(4, "0")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          {/* Status Bar */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${statusCfg.bgColor}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusCfg.color}`} />
              <span className={`font-body text-sm font-semibold ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
            </div>
            <span className="font-display text-2xl font-bold">
              ${invoice.amount.toLocaleString()}
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
                Client
              </p>
              <p className="font-body text-sm font-medium">{invoice.clientName}</p>
            </div>
            <div>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
                Service
              </p>
              <p className="font-body text-sm font-medium">
                {project?.serviceType || "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
                Due Date
              </p>
              <p className="font-body text-sm font-medium">
                {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {invoice.status !== "paid" && (
                  <span className={`text-xs ml-1.5 ${daysUntilDue < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
                {invoice.paidAt ? "Paid On" : "Status"}
              </p>
              <p className="font-body text-sm font-medium">
                {invoice.paidAt
                  ? new Date(invoice.paidAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Awaiting payment"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {invoice.status !== "paid" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  onSendReminder(invoice.id);
                  onOpenChange(false);
                }}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Send Reminder
              </Button>
              <Button
                onClick={() => {
                  onMarkPaid(invoice.id);
                  onOpenChange(false);
                }}
                className="gap-1.5"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Mark as Paid
              </Button>
            </>
          )}
          {invoice.status === "paid" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────
export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<MockInvoice[]>(MOCK_INVOICES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<MockInvoice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...invoices];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.clientName.toLowerCase().includes(q) || i.id.includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }
    result.sort((a, b) => {
      const cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [invoices, search, statusFilter, sortDir]);

  // Stats
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = totalPending + totalOverdue;

  // Actions
  const handleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "paid" as const, paidAt: new Date().toISOString().split("T")[0] } : i
      )
    );
    toast.success("Invoice marked as paid");
  };

  const handleSendReminder = (id: string) => {
    const inv = invoices.find((i) => i.id === id);
    toast.success(`Reminder sent to ${inv?.clientName || "client"}`);
  };

  const handleCreateInvoice = (data: Partial<MockInvoice>) => {
    const newInvoice: MockInvoice = {
      id: `inv${Date.now()}`,
      clientName: data.clientName || "",
      projectId: data.projectId || "",
      amount: data.amount || 0,
      status: "pending",
      dueDate: data.dueDate || "",
      paidAt: null,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    toast.success("Invoice created");
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
          <h1 className="font-display text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="font-body text-muted-foreground mt-1">
            Track payments and manage billing
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Create Invoice
        </Button>
      </motion.div>

      {/* Revenue Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-emerald-600">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                  Collected
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-amber-600">
                  ${totalPending.toLocaleString()}
                </p>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                  Pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-red-600">
                  ${totalOverdue.toLocaleString()}
                </p>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                  Overdue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-display font-bold">
                  {invoices.length}
                </p>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                  Total Invoices
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Collection Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-sm font-semibold">Collection Rate</p>
              <p className="font-body text-sm text-muted-foreground">
                ${totalRevenue.toLocaleString()} of ${(totalRevenue + totalOutstanding).toLocaleString()}
              </p>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(totalRevenue / (totalRevenue + totalOutstanding || 1)) * 100}%`,
                }}
                transition={{ duration: 1, delay: 0.3 }}
                className="bg-emerald-500 rounded-full"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(totalPending / (totalRevenue + totalOutstanding || 1)) * 100}%`,
                }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-amber-400"
              />
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(totalOverdue / (totalRevenue + totalOutstanding || 1)) * 100}%`,
                }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-red-400 rounded-r-full"
              />
            </div>
            <div className="flex items-center gap-6 mt-2">
              <span className="flex items-center gap-1.5 text-[10px] font-body text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Collected
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-body text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Pending
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-body text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-red-400" /> Overdue
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or invoice #..."
            className="pl-10 font-body"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] font-body text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="gap-1.5 font-body text-xs shrink-0"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortDir === "desc" ? "Newest" : "Oldest"}
          </Button>
        </div>
      </motion.div>

      {/* Invoice List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0 divide-y divide-border/50">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Receipt className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="font-body text-muted-foreground text-sm">
                  {search || statusFilter !== "all" ? "No invoices match your filters" : "No invoices yet"}
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((invoice, index) => {
                  const statusCfg = STATUS_CONFIG[invoice.status];
                  const StatusIcon = statusCfg.icon;
                  const project = MOCK_PROJECTS.find((p) => p.id === invoice.projectId);

                  return (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setDetailOpen(true);
                      }}
                    >
                      {/* Status Icon */}
                      <div className={`p-2.5 rounded-xl ${statusCfg.bgColor.split(" ")[0]} border ${statusCfg.bgColor.split(" ")[1]}`}>
                        <StatusIcon className={`h-4 w-4 ${statusCfg.color}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-body text-sm font-semibold truncate">
                            {invoice.clientName}
                          </p>
                          <span className="hidden sm:inline text-[10px] font-body text-muted-foreground">
                            #{invoice.id.replace("inv", "").padStart(4, "0")}
                          </span>
                        </div>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">
                          {project?.serviceType || "General"} ·{" "}
                          {invoice.paidAt
                            ? `Paid ${new Date(invoice.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                            : `Due ${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        </p>
                      </div>

                      {/* Amount + Status */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-display text-lg font-semibold">
                          ${invoice.amount.toLocaleString()}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusCfg.bgColor} ${statusCfg.color}`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Quick Actions (hover) */}
                      <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {invoice.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkPaid(invoice.id);
                            }}
                            title="Mark Paid"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                          </Button>
                        )}
                        {invoice.status !== "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendReminder(invoice.id);
                            }}
                            title="Send Reminder"
                          >
                            <Send className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoice(invoice);
                            setDetailOpen(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
        {filtered.length > 0 && (
          <p className="text-xs font-body text-muted-foreground mt-3 text-center">
            Showing {filtered.length} of {invoices.length} invoices
          </p>
        )}
      </motion.div>

      {/* Dialogs */}
      <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} onSave={handleCreateInvoice} />
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMarkPaid={handleMarkPaid}
        onSendReminder={handleSendReminder}
      />
    </div>
  );
}
