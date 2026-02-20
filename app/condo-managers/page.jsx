"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { Trash2, PlusCircle, RefreshCw, Pencil } from "lucide-react";
export default function ClientsPage() {
  const { user } = useUser();
  const router = useRouter();

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

  if (!user || user.role !== "OWNER") {
    return <p className="p-10">Accesso non autorizzato</p>;
  }

  const filteredClients = clients.filter((c) =>
    `${c.ragione_sociale} ${c.name} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10">
        <input
          placeholder="Cerca cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mb-6 px-4 py-2 border border-gray-200 rounded-lg text-gray-600"
        />

        {loading ? (
          <div className="loader w-16 h-16 border-4 items-center border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredClients.map((c) => (
              <li
                key={c.id}
                className="relative bg-white p-5 rounded-xl border shadow cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(`/condo-managers/${c.id}`)}
              >
                <p className="font-semibold text-gray-600">
                  {c.ragione_sociale}
                </p>
                <p className="text-sm text-gray-500">
                  {c.name} {c.cognome}
                </p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
