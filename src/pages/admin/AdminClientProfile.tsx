import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Camera,
  Tag,
  Edit2,
  Folder,
  CheckCircle,
  Clock,
  Image,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_CLIENTS, MOCK_PROJECTS, MOCK_INVOICES, MOCK_GALLERY_STATS } from "@/lib/mockData";

const TAG_COLORS: Record<string, string> = {
  Wedding: "bg-pink-100 text-pink-700 border-pink-200",
  Portrait: "bg-blue-100 text-blue-700 border-blue-200",
  Brand: "bg-purple-100 text-purple-700 border-purple-200",
  Events: "bg-amber-100 text-amber-700 border-amber-200",
  Commercial: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Engagement: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
  shooting: { label: "Shooting", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Camera },
  editing: { label: "Editing", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Image },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

export default function AdminClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const client = MOCK_CLIENTS.find((c) => c.id === id);
  const clientProjects = MOCK_PROJECTS.filter((p) => p.clientId === id);
  const clientInvoices = MOCK_INVOICES.filter((inv) =>
    clientProjects.some((p) => p.id === inv.projectId)
  );
  const clientGalleries = MOCK_GALLERY_STATS.filter((g) =>
    g.clientName === client?.name
  );

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-muted-foreground">Client not found.</p>
        <Button variant="outline" onClick={() => navigate("/admin/clients")} className="mt-4">
          Back to Clients
        </Button>
      </div>
    );
  }

  const initials = client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalPaid = clientInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);

  const totalPending = clientInvoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/clients")}
          className="gap-1.5 text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          All Clients
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shrink-0"
            style={{ backgroundColor: client.avatarColor }}
          >
            {initials}
          </div>

          {/* Name + Meta */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {client.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-body text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {client.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {client.phone}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined{" "}
                {new Date(client.joinedAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {client.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-xs ${TAG_COLORS[tag] || ""}`}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Financial Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
              Lifetime Value
            </p>
            <p className="text-2xl font-display font-bold text-foreground">
              ${client.totalSpent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
              Total Paid
            </p>
            <p className="text-2xl font-display font-bold text-emerald-600">
              ${totalPaid.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
              Pending
            </p>
            <p className={`text-2xl font-display font-bold ${totalPending > 0 ? "text-amber-600" : "text-foreground"}`}>
              ${totalPending.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mb-1">
              Projects
            </p>
            <p className="text-2xl font-display font-bold text-foreground">
              {clientProjects.length}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two columns: Projects + Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientProjects.length === 0 ? (
                <p className="text-sm font-body text-muted-foreground text-center py-8">
                  No projects yet
                </p>
              ) : (
                clientProjects.map((project) => {
                  const statusCfg = statusConfig[project.status];
                  const StatusIcon = statusCfg?.icon || Clock;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate("/admin/projects")}
                    >
                      <div className={`p-2 rounded-lg ${statusCfg?.color.split(" ")[0]} ${statusCfg?.color.split(" ")[1]}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium truncate">
                          {project.serviceType}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {new Date(project.eventDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          · {project.location}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${statusCfg?.color}`}
                        >
                          {statusCfg?.label}
                        </Badge>
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          ${project.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Invoices + Gallery */}
        <div className="space-y-6">
          {/* Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {clientInvoices.length === 0 ? (
                  <p className="text-sm font-body text-muted-foreground text-center py-8">
                    No invoices yet
                  </p>
                ) : (
                  clientInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40"
                    >
                      <div>
                        <p className="font-body text-sm font-medium">
                          ${inv.amount.toLocaleString()}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {inv.paidAt
                            ? `Paid ${new Date(inv.paidAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}`
                            : `Due ${new Date(inv.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}`}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          inv.status === "paid"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : inv.status === "overdue"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-amber-100 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inv.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  Galleries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {clientGalleries.length === 0 ? (
                  <p className="text-sm font-body text-muted-foreground text-center py-8">
                    No galleries linked
                  </p>
                ) : (
                  clientGalleries.map((gallery) => (
                    <div
                      key={gallery.albumId}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate("/admin/gallery")}
                    >
                      <div>
                        <p className="font-body text-sm font-medium">
                          {gallery.albumTitle}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {gallery.totalPhotos} photos · {gallery.favorites} ❤️
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          gallery.status === "delivered"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : gallery.status === "proofing"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {gallery.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
