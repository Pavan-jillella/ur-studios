import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  getAllProfiles,
  updateProfileRole,
  type Profile,
} from "@/api/profiles";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User } from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (err) {
      toast.error("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleRoleChange = async (userId: string, role: "admin" | "client") => {
    if (userId === user?.id) {
      toast.error("You cannot change your own role");
      return;
    }
    setUpdatingId(userId);
    try {
      const updated = await updateProfileRole(userId, role);
      setProfiles((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success(`User role updated to ${role}`);
    } catch (err) {
      toast.error("Failed to update role");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Users
        </h1>
        <p className="font-body text-muted-foreground mt-1">
          Manage user roles and permissions
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="font-body text-lg">No users found</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {profile.role === "admin" ? (
                          <Shield className="h-4 w-4 text-amber-600" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {profile.full_name || "Unnamed User"}
                        </p>
                        {profile.id === user?.id && (
                          <span className="text-xs text-muted-foreground">
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        profile.role === "admin"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-blue-100 text-blue-800 border-blue-200"
                      }
                    >
                      {profile.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {profile.id === user?.id ? (
                      <span className="text-xs text-muted-foreground">
                        Cannot edit own role
                      </span>
                    ) : (
                      <Select
                        value={profile.role}
                        onValueChange={(value: "admin" | "client") =>
                          handleRoleChange(profile.id, value)
                        }
                        disabled={updatingId === profile.id}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
