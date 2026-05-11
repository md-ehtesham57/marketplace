"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth.context";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
  };
}

const roleColors: Record<string, string> = {
  BUYER:  "bg-blue-100 text-blue-700",
  SELLER: "bg-purple-100 text-purple-700",
  ADMIN:  "bg-red-100 text-red-700",
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/users/admin/all", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("FetchUsers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await fetch("http://localhost:4000/api/users/admin/" + userId + "/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchUsers();
    } catch (error) {
      console.error("ToggleStatus error:", error);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-slate-500 text-sm mt-1">{total} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
        >
          <option value="ALL">All Roles</option>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No users found</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Orders</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Reviews</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sky-600 font-bold text-sm">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " + (roleColors[user.role] || "bg-slate-100 text-slate-700")}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user._count?.orders || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {user._count?.reviews || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={"inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium " + (user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={"text-xs font-medium transition-colors " + (user.isActive ? "text-red-400 hover:text-red-600" : "text-green-500 hover:text-green-700")}
                      >
                        {user.isActive ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}