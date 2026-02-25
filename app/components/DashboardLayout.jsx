"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // 🔴 fondamentale
    setUser(null);
    router.replace("/login"); // ⬅️ replace, non push
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggle={() => setOpen(true)} />

      {/* 👇 layout ORIZZONTALE */}

      <div className="flex">
        {user && (
          <Sidebar
            open={open}
            onClose={() => setOpen(false)}
            role={user.role}
            onLogout={handleLogout}
          />
        )}
        {/* 👇 CONTENTO ACCANTO */}
        <main className="flex-1 p-6 md:p-10 lg:ml-64 overflow-y-auto h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
