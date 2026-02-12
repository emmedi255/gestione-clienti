"use client";

import { useUser } from "../context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { menuConfig } from "../utils/menuConfig";

export default function Sidebar() {
  const { user, setUser, loading: userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  if (!user || userLoading) return null;

  // Menu dinamico in base al ruolo
  const menuItems = menuConfig[user.role] || [];

  const handleLogout = () => {
    setUser(null);
    document.cookie = "session_user=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col flex-shrink-0">
      <div className="p-6 font-bold text-blue-900 text-lg">
        Gestionale
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`text-left px-4 py-3 rounded-lg transition
              ${pathname === item.href
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-600 hover:bg-gray-100"
              }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-600"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
