"use client";

import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useCondomini } from "../context/CondominiContext";
import {
  FileText,
  FileSpreadsheet,
  LogOut,
  PlusCircle,
  Trash2,
  RefreshCw,
  Building,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout"; // importa qui

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { user, setUser, loading: userLoading } = useUser();
  const { condomini, setCondomini } = useCondomini();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login"); // rimanda a login
    }
  }, [user, router]);
  /* ===================== FETCH DATI ===================== */
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/get-condomini?user_id=${user.id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCondomini(data.condomini || []);
    } catch (err) {
      console.error(err);
      setError("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  /* ===================== HANDLERS ===================== */
  const handleLogout = () => {
    setUser(null);
    document.cookie = "session_user=; path=/; max-age=0";
    router.push("/login");
  };

  const handleDeleteCondominio = async (condominio_id) => {
    if (!confirm("Sei sicuro di voler eliminare questo condominio?")) return;

    try {
      const res = await fetch(`/api/condomini/${condominio_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // ✅ Fix: usa condominio_id, non id
      setCondomini((prev) =>
        prev.filter((c) => c.condominio_id !== condominio_id),
      );
    } catch (err) {
      alert("Errore durante l'eliminazione del condominio"); // ✅ Fix: testo corretto
    }
  };

  const goToSignup = () => router.push("/signup");

  /* ===================== UTILS ===================== */
  const renderDocumentIcon = (type) =>
    type.toLowerCase() === "pdf" ? (
      <FileText className="text-red-500 w-5 h-5" />
    ) : (
      <FileSpreadsheet className="text-green-500 w-5 h-5" />
    );

  /* ===================== HEADER ===================== */
  const StickyHeader = ({ title }) => (
    <div className="sticky top-0 z-50 bg-gray-50 p-6 md:p-10 flex justify-between items-center border-b border-gray-200">
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

  if (!user)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-center mt-10 text-gray-500 font-medium">
          Accesso richiesto
        </p>
      </div>
    );

  const filteredCondomini = condomini.filter((c) =>
    `${c.condominio} ${c.citta} ${c.provincia} ${c.cf_condominio}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  /* ===================== DASHBOARD CLIENT ===================== */
  return (
    <div className="min-h-screen justify-center bg-gradient-to-b from-blue-100 to-white font-sans">
      <DashboardLayout>
        <div className="p-6 md:p-10">
          <input
            placeholder="Cerca condominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mb-6 px-4 py-2 border border-gray-200 rounded-lg text-gray-600"
          />
          {loading ? (
            <div className="flex justify-center items-center mt-20">
              <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : condomini.length === 0 ? (
            <div className="flex flex-col items-center gap-6 mt-20">
              <p className="text-gray-500 text-lg">Nessun condominio trovato</p>
            </div>
          ) : (
            <>
              {filteredCondomini.length === 0 ? (
                <p className="text-gray-400 text-center mt-10">
                  Nessun risultato trovato
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-3 gap-6">
                  {filteredCondomini.map((condominio) => (
                    <li
                      key={condominio.condominio_id}
                      onClick={() =>
                        router.push(`/condomini/${condominio.condominio_id}`)
                      }
                      className="cursor-pointer p-5 bg-white rounded-xl shadow hover:shadow-md transition border relative"
                    >
                      <button
                        onClick={(e) => {
                          // ✅ Aggiungi event
                          e.stopPropagation(); // ✅ Blocca navigazione
                          handleDeleteCondominio(condominio.condominio_id); // ✅ Funzione corretta
                        }}
                        title="Elimina condominio"
                        className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition z-10"
                      >
                        <Trash2 size={18} />
                      </button>

                      <p className="font-semibold text-gray-700 text-lg">
                        {condominio.condominio}
                      </p>
                      <p className="text-sm text-gray-500">
                        {condominio.condominio_indirizzo}
                      </p>
                      <p className="text-sm text-gray-500">
                        {condominio.citta}, {condominio.provincia} -{" "}
                        {condominio.cap}
                      </p>
                      <p className="text-xs text-gray-400">
                        CF: {condominio.cf_condominio}
                      </p>
                      {/* ICONA DOCUMENTI */}
                      {condominio.documents?.length > 0 ? (
                        <ul className="flex flex-col gap-2 mt-3">
                          {condominio.documents.map((doc, index) => {
                            const key =
                              doc.id ||
                              `${condominio.condominio_id}-doc-${index}`;
                            let fileName = doc.document_key;
                            {
                              doc.document_key === "nomina-responsabile-esterno"
                                ? (fileName = doc.file_url.split("_").pop())
                                : fileName;
                            }
                            return (
                              <li key={key}>
                                <a
                                  href={doc.signedUrl || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 text-gray-600 text-xs hover:underline hover:opacity-80 cursor-pointer transition"
                                  title={fileName}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {renderDocumentIcon(doc.type)}
                                  {fileName}
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-xs mt-2">
                          Nessun documento
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}
