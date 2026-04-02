import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  DollarSign,
  Camera,
  Image,
  CheckCircle,
  LayoutGrid,
  List,
  Filter,
  Search,
  X,
  FileEdit,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MOCK_PROJECTS, type MockProject } from "@/lib/mockData";

// ─── Pipeline columns ──────────────────────
type PipelineStatus = "draft" | "shooting" | "editing" | "delivered";

interface PipelineColumn {
  status: PipelineStatus;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  dotColor: string;
}

const COLUMNS: PipelineColumn[] = [
  {
    status: "draft",
    label: "Draft",
    icon: FileEdit,
    color: "text-gray-600",
    bgColor: "bg-gray-50 border-gray-200",
    dotColor: "bg-gray-400",
  },
  {
    status: "shooting",
    label: "Shooting",
    icon: Camera,
    color: "text-blue-600",
    bgColor: "bg-blue-50/50 border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    status: "editing",
    label: "Editing",
    icon: Image,
    color: "text-amber-600",
    bgColor: "bg-amber-50/50 border-amber-200",
    dotColor: "bg-amber-500",
  },
  {
    status: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50/50 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
];

const paymentBadge: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  unpaid: "bg-red-100 text-red-700 border-red-200",
};

// ─── Project Card (Kanban) ──────────────────────
function ProjectCard({
  project,
  onMoveForward,
  onMoveBack,
  columnIndex,
}: {
  project: MockProject;
  onMoveForward: () => void;
  onMoveBack: () => void;
  columnIndex: number;
}) {

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 cursor-default group">
        <CardContent className="p-4 space-y-3">
          {/* Client + Service */}
          <div>
            <p className="font-body text-sm font-semibold text-foreground leading-tight">
              {project.clientName}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {project.serviceType}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>
                {new Date(project.eventDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{project.location}</span>
            </div>
          </div>

          {/* Payment + Amount */}
          <div className="flex items-center justify-between pt-1">
            <Badge
              variant="outline"
              className={`text-[10px] ${paymentBadge[project.paymentStatus] || ""}`}
            >
              <DollarSign className="h-2.5 w-2.5 mr-0.5" />
              {project.paymentStatus}
            </Badge>
            <span className="font-display text-sm font-semibold">
              ${project.amount.toLocaleString()}
            </span>
          </div>

          {/* Move Actions */}
          <div className="flex items-center gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {columnIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-body gap-1 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveBack();
                }}
              >
                ← {COLUMNS[columnIndex - 1].label}
              </Button>
            )}
            {columnIndex < COLUMNS.length - 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-body gap-1 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveForward();
                }}
              >
                {COLUMNS[columnIndex + 1].label} →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── List View Row ──────────────────────
function ProjectListRow({ project, index }: { project: MockProject; index: number }) {
  const statusCfg = COLUMNS.find((c) => c.status === project.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer rounded-lg"
    >
      <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusCfg?.dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-medium truncate">{project.clientName}</p>
        <p className="font-body text-xs text-muted-foreground">{project.serviceType}</p>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-xs font-body text-muted-foreground shrink-0">
        <Calendar className="h-3 w-3" />
        {new Date(project.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </div>
      <div className="hidden md:block text-xs font-body text-muted-foreground shrink-0">
        {project.location}
      </div>
      <Badge variant="outline" className={`text-[10px] shrink-0 ${statusCfg?.bgColor}`}>
        {statusCfg?.label}
      </Badge>
      <Badge variant="outline" className={`text-[10px] shrink-0 ${paymentBadge[project.paymentStatus]}`}>
        ${project.amount.toLocaleString()}
      </Badge>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────
export default function AdminProjects() {
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Filter
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.clientName.toLowerCase().includes(q) ||
          p.serviceType.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }
    if (paymentFilter !== "all") {
      result = result.filter((p) => p.paymentStatus === paymentFilter);
    }
    return result;
  }, [projects, search, paymentFilter]);

  // Group by status for kanban
  const grouped = useMemo(() => {
    const map: Record<PipelineStatus, MockProject[]> = {
      draft: [],
      shooting: [],
      editing: [],
      delivered: [],
    };
    filteredProjects.forEach((p) => {
      map[p.status as PipelineStatus]?.push(p);
    });
    // Sort each column by event date
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    );
    return map;
  }, [filteredProjects]);

  // Move project between stages
  const moveProject = (projectId: string, newStatus: PipelineStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );
    const statusLabel = COLUMNS.find((c) => c.status === newStatus)?.label;
    toast.success(`Moved to ${statusLabel}`);
  };

  // Stats
  const totalValue = projects.reduce((s, p) => s + p.amount, 0);

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
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Projects
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            {projects.length} projects · ${totalValue.toLocaleString()} total value
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className="gap-1.5"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Pipeline
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-1.5"
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
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
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[160px] font-body text-sm">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {COLUMNS.map((column, colIndex) => {
            const ColIcon = column.icon;
            const colProjects = grouped[column.status];
            return (
              <div key={column.status} className="space-y-3">
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${column.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <ColIcon className={`h-4 w-4 ${column.color}`} />
                    <span className={`font-body text-sm font-semibold ${column.color}`}>
                      {column.label}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                    {colProjects.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[100px]">
                  <AnimatePresence mode="popLayout">
                    {colProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        columnIndex={colIndex}
                        onMoveForward={() => {
                          if (colIndex < COLUMNS.length - 1) {
                            moveProject(project.id, COLUMNS[colIndex + 1].status);
                          }
                        }}
                        onMoveBack={() => {
                          if (colIndex > 0) {
                            moveProject(project.id, COLUMNS[colIndex - 1].status);
                          }
                        }}
                      />
                    ))}
                  </AnimatePresence>
                  {colProjects.length === 0 && (
                    <div className="text-center py-8 text-xs font-body text-muted-foreground/60 border-2 border-dashed border-border/40 rounded-xl">
                      No projects
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-2 divide-y divide-border/50">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16">
                  <Camera className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="font-body text-muted-foreground text-sm">
                    No projects match your filters
                  </p>
                </div>
              ) : (
                filteredProjects
                  .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                  .map((project, index) => (
                    <ProjectListRow key={project.id} project={project} index={index} />
                  ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
