"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {
  FileText,
  FileSpreadsheet,
  LogOut,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, setUser, loading: userLoading } = useUser();
  const router = useRouter();
  const [search, setSearch] = useState("");


  const [clients, setClients] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ===================== FETCH DATI ===================== */
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        if (user.role === "OWNER") {
          const res = await fetch("/api/customers");
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          setClients(data.clients || []);
        } else {
          const res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }),
          });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          setDocuments(data.documents || []);
        }
      } catch (err) {
        setError("Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  /* ===================== HANDLERS ===================== */
  const handleLogout = () => {
    setUser(null);
    document.cookie = "session_user=; path=/; max-age=0";
    router.push("/login");
  };

  const handleAddCompany = () => {
    router.push("/add-company");
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm("Sei sicuro di voler eliminare questo cliente?")) return;

    try {
      const res = await fetch(`/api/customers/${clientId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setClients((prev) => prev.filter((c) => c.id !== clientId));
    } catch (err) {
      alert("Errore durante l'eliminazione del cliente");
    }
  };

  /* ===================== UTILS ===================== */
  const renderDocumentIcon = (type) =>
    type.toLowerCase() === "pdf" ? (
      <FileText className="text-red-500 w-5 h-5" />
    ) : (
      <FileSpreadsheet className="text-green-500 w-5 h-5" />
    );

  /* ===================== HEADER ===================== */
  const StickyHeader = ({ title }) => (
    <div className="sticky top-0 z-50 bg-gray-50 p-6 md:p-10 flex justify-between items-center border-b border-gray-200 ">
      <h1 className="text-3xl font-bold text-blue-900">{title}</h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        <LogOut size={20} /> Logout
      </button>
    </div>
  );

  /* ===================== GUARD ===================== */
  if (userLoading)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="loader w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );


  if (!user) {
    return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-center mt-10 text-gray-500 font-medium">
        Accesso richiesto
      </p>
      </div>
    );
  }
const filteredClients = clients.filter((c) =>
  `${c.company} ${c.name} ${c.email}`
    .toLowerCase()
    .includes(search.toLowerCase())
);

  /* ===================== OWNER DASHBOARD ===================== */
  if (user.role === "OWNER") {
    return (
    <div className="min-h-screen  justify-center bg-gradient-to-b from-blue-50 to-white font-sans">
      
        <StickyHeader title={`Ciao ${user.name}`} />

        <div className="p-6 md:p-10">
            <div className="mb-8 flex justify-center">
  <div className="w-full max-w-md">
    <input
      type="text"
      placeholder="Cerca cliente..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="
        w-full px-4 py-3 rounded-xl bg-white border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500
        placeholder:text-gray-400 text-gray-500
        shadow-sm
      "
    />
  </div>
</div>
          {loading ? (
           <div className="flex justify-center items-center mt-20">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : clients.length === 0 ? (
            <p className="text-gray-500">Nessun cliente trovato.</p>
          ) : (
            <div>
            


            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {clients.map((c) => (
                <li
                  key={c.id}
                  className="relative p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-200"
                >
                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClient(c.id)}
                    title="Elimina cliente"
                    className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="mb-3">
                    <p className="text-lg font-semibold text-gray-800">
                      {c.company || "—"}
                    </p>
                    <p className="text-sm font-medium text-gray-500">
                      {c.name}
                    </p>
                    <p className="text-sm text-gray-400 break-all">
                      {c.email}
                    </p>
                  </div>

                  {c.documents?.length > 0 ? (
                    <ul className="flex flex-col gap-2 mt-2">
                      {c.documents.map((doc) => (
                        <li key={doc.id} className="flex items-center gap-2">
                          {renderDocumentIcon(doc.type)}
                          <a
                            href={doc.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                          >
                            {doc.file_url.split("/").pop()}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm mt-2">
                      Nessun documento
                    </p>
                  )}
                </li>
              ))}
            </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ===================== CLIENT DASHBOARD ===================== */
  return (
    <div className="min-h-screen justify-center bg-gradient-to-b from-blue-100 to-white font-sans">
      <StickyHeader title={`Ciao ${user.name}`} />

      <div className="p-6 md:p-10">
        {loading ? (
          <div className="flex justify-center items-center mt-20">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center gap-6 mt-20">
            <p className="text-gray-500 text-lg">
              Nessun documento trovato
            </p>
            <button
              onClick={handleAddCompany}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <PlusCircle size={20} /> Inserisci la tua azienda
            </button>
          </div>
        ) : (
          <>
          <div className="pb-5 text-blue-500">
          <h5><strong>i tuoi documenti</strong></h5>
          </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="p-5 bg-white rounded-xl shadow hover:shadow-md transition border border-gray-200 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    {renderDocumentIcon(doc.type)}
                    <span className="font-semibold text-gray-700">
                      {doc.type}
                    </span>
                  </div>

                  <a
                    href={doc.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-sm"
                  >
                    {doc.file_url.split("/").pop()}
                  </a>

                  <p className="text-sm text-gray-500">
                    Creato il:{" "}
                    {new Date(doc.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex justify-center mt-10">
              <button
                onClick={handleAddCompany}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Modifica i tuoi dati
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
