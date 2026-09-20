import React, { useState } from "react";
import { Shield, Search, ChevronDown, CheckCircle2, XCircle, Users, ExternalLink, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const roleOptions = [
  { key: "all", label: "All Users", badgeClass: "bg-slate-100 text-slate-800" },
  { key: "user", label: "Users", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "fundraiser", label: "Fundraisers", badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "moderator", label: "Moderators", badgeClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "admin", label: "Admins", badgeClass: "bg-purple-50 text-purple-700 border-purple-200" },
];

const UsersTab = ({ users = [], loading = false, error = null, handleRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState("all");

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRole === "all" || u.role === selectedRole;
    const matchesKyc =
      kycFilter === "all" ||
      (kycFilter === "verified" && u.kyc_verified) ||
      (kycFilter === "unverified" && !u.kyc_verified);
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesKyc && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            User Management & Role Permissions
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage user accounts, assign fundraiser/admin privileges, and inspect KYC compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-bold py-1 px-3 bg-muted">
            Total Accounts: {users.length}
          </Badge>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, @username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border overflow-x-auto">
            {roleOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedRole(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  selectedRole === opt.key
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label} ({
                  opt.key === "all"
                    ? users.length
                    : users.filter((u) => u.role === opt.key).length
                })
              </button>
            ))}
          </div>

          {/* KYC Filter */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setKycFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                kycFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              All KYC
            </button>
            <button
              onClick={() => setKycFilter("verified")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                kycFilter === "verified" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setKycFilter("unverified")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                kycFilter === "unverified" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"
              }`}
            >
              Unverified
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Loading platform users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No users found matching your search and filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">KYC Trust</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4 text-right">Role Permissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/user/${user.username}`}
                              className="font-bold text-foreground hover:text-indigo-600 transition-colors flex items-center gap-1"
                            >
                              <span>{user.name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Link>
                            <p className="text-[10px] text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">{user.email}</td>

                      <td className="py-3.5 px-4">
                        {user.kyc_verified ? (
                          <Badge variant="success" className="text-[10px] font-bold py-0.5 px-2">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1 inline" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] font-bold py-0.5 px-2 text-muted-foreground">
                            <XCircle className="h-2.5 w-2.5 mr-1 inline" /> Unverified
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase py-0.5 px-2 ${
                            user.role === "admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : user.role === "fundraiser"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : user.role === "moderator"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-background border border-border text-foreground text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="user">User</option>
                          <option value="fundraiser">Fundraiser</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersTab;
