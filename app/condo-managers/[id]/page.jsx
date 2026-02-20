"use client";

import { useParams } from "next/navigation"; // importa useParams
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import { FileText, FileSpreadsheet, Trash2 } from "lucide-react";

export default function AdminClientDashboard() {
  const params = useParams(); // ✅ recupera i param dinamici
  const { id } = params; // ora id funziona
  const router = useRouter();

  const [client, setClient] = useState(null);
  const [condomini, setCondomini] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        console.log("id cliente:", id);
        // fetch dati cliente
        const resUser = await fetch(`/api/profile/${id}`);
        const dataUser = await resUser.json();
        if (dataUser.error) throw new Error(dataUser.error);
        setClient(dataUser.user);

        // fetch condomini
        const resCond = await fetch(`/api/get-condomini?user_id=${id}`);
        const dataCond = await resCond.json();
        if (dataCond.error) throw new Error(dataCond.error);
        setCondomini(dataCond.condomini || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Errore nel caricamento dei dati");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  const handleDeleteCondominio = async (condominio_id) => {
    if (!confirm("Sei sicuro di voler eliminare questo condominio?")) return;

    try {
      const res = await fetch(`/api/condomini/${condominio_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCondomini((prev) =>
        prev.filter((c) => c.condominio_id !== condominio_id),
      );
    } catch (err) {
      alert("Errore durante l'eliminazione del condominio");
    }
  };

  const renderDocumentIcon = (type) =>
    type.toLowerCase() === "pdf" ? (
      <FileText className="text-red-500 w-5 h-5" />
    ) : (
      <FileSpreadsheet className="text-green-500 w-5 h-5" />
    );

  if (loading)
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );

  if (error || !client)
    return (
      <DashboardLayout>
        <p className="text-red-500 p-10">{error || "Cliente non trovato"}</p>
      </DashboardLayout>
    );

  const filteredCondomini = condomini.filter((c) =>
    `${c.condominio} ${c.citta} ${c.provincia} ${c.cf_condominio}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="p-6 pt-0">
        <h1 className="text-3xl font-bold mb-4 text-gray-600">
          {client.ragione_sociale}
        </h1>
        <p className="text-gray-600">
          {client.name} {client.cognome}
        </p>
        <p className="text-gray-400">{client.email}</p>
        <div className="pt-4">
          <input
            placeholder="Cerca condominio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md mb-6 px-4 py-2 border border-gray-200 rounded-lg text-gray-600"
          />
        </div>
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
                    e.stopPropagation();
                    handleDeleteCondominio(condominio.condominio_id);
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
                  {condominio.citta}, {condominio.provincia} - {condominio.cap}
                </p>
                <p className="text-xs text-gray-400">
                  CF: {condominio.cf_condominio}
                </p>

                {condominio.documents?.length > 0 ? (
                  <ul className="flex flex-col gap-2 mt-3">
                    {condominio.documents.map((doc, index) => (
                      <li
                        key={
                          doc.id || `${condominio.condominio_id}-doc-${index}`
                        }
                      >
                        <a
                          href={doc.signedUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-gray-600 text-xs hover:underline hover:opacity-80 cursor-pointer transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {renderDocumentIcon(doc.type)}
                          {doc.document_key}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-xs mt-2">Nessun documento</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
