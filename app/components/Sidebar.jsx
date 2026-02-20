"use client";

import { useState, useRef, useEffect } from "react";
import {
  Home,
  Building,
  Users,
  PlusCircle,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useUser } from "../context/UserContext";

export default function Sidebar({ open, onClose, role, onLogout }) {
  const router = useRouter();
  const { user } = useUser();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* 👇 chiude dropdown cliccando fuori */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ownerMenu = [
    { label: "Dashboard", icon: Building, path: "/dashboard" },
    { label: "Nuovo Condominio", icon: PlusCircle, path: "/add-company" },
    { label: "Clienti", icon: Users, path: "/condo-managers" },
    { label: "Nuovo Amministratore", icon: User, path: "/signup" },
  ];

  const clientMenu = [
    { label: "Dashboard", icon: Home, path: "/dashboard" },
    { label: "Nuovo Condominio", icon: PlusCircle, path: "/add-company" },
  ];

  const menu = role === "OWNER" ? ownerMenu : clientMenu;

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-23 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r z-50",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* ===== USER HEADER ===== */}
        <div ref={profileRef} className="relative p-4 border-b">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-3 w-full hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user?.name?.charAt(0)}
              {user?.cognome?.charAt(0)}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-gray-800">
                {user?.name} {user?.cognome}
              </span>
            </div>
          </button>

          {/* ===== DROPDOWN ===== */}
          {profileOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  router.push("/profile");
                  setProfileOpen(false);
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 text-sm text-gray-600"
              >
                <User className="w-4 h-4 text-gray-600" />
                Visualizza profilo
              </button>

              <button
                onClick={() => {
                  router.push("/profile/edit");
                  setProfileOpen(false);
                  onClose();
                }}
                className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 text-sm text-gray-600"
              >
                <Settings className="w-4 h-4 text-gray-600" />
                Modifica dati
              </button>

              <hr />

              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* ===== MENU ===== */}
        <nav className="flex flex-col gap-1 p-4">
          {menu.map(({ label, icon: Icon, path }) => (
            <button
              key={label}
              onClick={() => {
                router.push(path);
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700"
            >
              <Icon className="w-5 h-5 text-blue-600" />
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
