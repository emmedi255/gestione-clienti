"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import {
  Trash2,
  PlusCircle,
  RefreshCw,
  Pencil,
  ArrowRight,
} from "lucide-react";
import EditAdminModal from "../components/EditAdminModal";
export default function ClientsPage() {
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.push("/login"); // rimanda a login
    }
  }, [user, router]);
  const [deleting, setDeleting] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "OWNER") return;

    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (user?.role !== "OWNER") return;

    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .finally(() => setLoading(false));
  }, [selectedAdminId]);

  if (!user || user.role !== "OWNER") {
    return <p className="p-10">Accesso non autorizzato</p>;
  }

  const filteredClients = clients.filter((c) =>
    `${c.ragione_sociale} ${c.name} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleDelete = async (adminId) => {
    setDeleting(true);
    if (!confirm("Eliminare definitivamente questo amministratore?")) return;

    try {
      await fetch(`/api/customers/${adminId}`, { method: "DELETE" });
      setClients(clients.filter((c) => c.id !== adminId));
    } catch (err) {
      alert("Errore eliminazione");
    }
    setDeleting(false);
  };
  return (
    <DashboardLayout>
      <div className="sticky top-0 p-0 bg-gray z-50 pb-4">
        <input
          placeholder="Cerca amministratore..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-full max-w-md px-4 py-2 border bg-white border-gray-200 rounded-lg text-gray-600"
        />
      </div>
      <div className="p-6 md:p-10">
        {loading ? (
          <div className="loader w-16 h-16 border-4 items-center border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredClients.map((c) => {
              const isActive = new Date(c.password_expiration) >= new Date();

              return (
                <li
                  key={c.id}
                  onClick={() => router.push(`/condo-managers/${c.id}`)}
                  className="group relative bg-gradient-to-br from-white to-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200
             hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50
             transition-all duration-300 cursor-pointer"
                >
                  {/* HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    {/* STATUS */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isActive
                            ? "text-green-700 bg-green-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        {isActive ? "Attivo" : "Disattivato"}
                      </span>
                    </div>
                  </div>

                  {/* TITLE */}
                  <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 break-words">
                    {c?.ragione_sociale ? c.ragione_sociale : "-"}
                  </h3>

                  {/* DETAILS */}
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-semibold text-gray-700 break-words">
                      {c.name} {c.cognome}
                    </p>

                    <p className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                      {c.email}
                    </p>
                    <div>
                      <p
                        className={`text-xs px-2 py-0.5 rounded-md inline-block max-w-full truncate ${
                          isActive
                            ? "text-slate-600 bg-slate-100"
                            : "text-red-700 bg-red-100"
                        }`}
                      >
                        Data validità: {c.password_expiration}
                      </p>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      ID: {c.id.slice(-8)}
                    </span>

                    <span className="text-xs text-slate-500">
                      Role: {c.role}
                    </span>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-2 pt-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdminId(c.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold
                   bg-white border border-blue-200 rounded-lg text-blue-700
                   hover:bg-blue-50"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Modifica
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold
                   bg-white border border-rose-200 rounded-lg text-rose-700
                   hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Elimina
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedAdminId && (
        <EditAdminModal
          adminId={selectedAdminId}
          onClose={() => setSelectedAdminId(null)}
        />
      )}
    </DashboardLayout>
  );
}
