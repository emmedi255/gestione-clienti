"use client";

import { useState, useEffect } from "react";
import { provinceItaliane } from "../utils/provinceItaliane";

export function FornitoriSection({
  userId,
  addedFornitori,
  setAddedFornitori,
}) {
  const [fornitoriList, setFornitoriList] = useState([]);
  const [selectedFornitoreId, setSelectedFornitoreId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newFornitore, setNewFornitore] = useState({
    nome: "",
    cognome: "",
    ragioneSociale: "",
    indirizzo: "",
    citta: "",
    cap: "",
    provincia: "",
    cf: "",
    attivita: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  // Carica fornitori dal DB
  useEffect(() => {
    async function fetchFornitori() {
      try {
        const res = await fetch(`/api/fornitori?userId=${userId}`);
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        setFornitoriList(result.data || []);
      } catch (err) {
        console.error("Errore caricamento fornitori:", err.message);
      }
    }
    if (userId) fetchFornitori();
  }, [userId]);

  // Aggiungi fornitore selezionato
  // ✅ usa direttamente le props
  const addSelectedFornitore = () => {
    if (!selectedFornitoreId) return;

    const forn = fornitoriList.find(
      (f) => String(f.fornitore_id) === String(selectedFornitoreId),
    );
    if (!forn) return;
    if (
      addedFornitori.some(
        (f) => String(f.fornitore_id) === String(forn.fornitore_id),
      )
    )
      return;

    setAddedFornitori([...addedFornitori, forn]); // aggiorna il form nel parent
  };

  const deleteSelectedFornitore = async () => {
    if (!selectedFornitoreId) return;

    if (
      !confirm(
        "Sei sicuro di voler eliminare questo fornitore? verrà eliminato dalla tua lista fornitori",
      )
    )
      return;

    try {
      const res = await fetch(`/api/fornitori?id=${selectedFornitoreId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.error) {
        alert(`Errore: ${data.error}`);
        return;
      }

      // ⬇️ rimuovi dalla tabella
      const newAdded = addedFornitori.filter(
        (f) => String(f.fornitore_id) !== String(selectedFornitoreId),
      );

      // ⬇️ rimuovi ANCHE dalla select
      const newList = fornitoriList.filter(
        (f) => String(f.fornitore_id) !== String(selectedFornitoreId),
      );

      setAddedFornitori(newAdded);
      setFornitoriList(newList);
      setSelectedFornitoreId("");
    } catch (err) {
      console.error(err);
      alert("Errore di rete durante l'eliminazione");
    }
  };

  const addNewFornitore = async () => {
    if (!newFornitore.nome.trim()) return;
    try {
      const res = await fetch("/api/fornitori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...newFornitore }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      // Aggiorna liste
      setFornitoriList([...fornitoriList, result.data]);
      setAddedFornitori([...addedFornitori, result.data]);

      setSuccessMessage("Fornitore aggiunto!");
      setTimeout(() => {
        setSuccessMessage("");
        setShowModal(false);
        setNewFornitore({ nome: "", indirizzo: "", cf: "", attivita: "" });
      }, 500);
    } catch (err) {
      console.error("Errore inserimento fornitore:", err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Selezione fornitori e pulsanti */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={selectedFornitoreId}
          onChange={(e) => setSelectedFornitoreId(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 flex-1 min-w-[150px]"
        >
          <option value="">Seleziona fornitore</option>
          {fornitoriList.map((f) => (
            <option key={f.fornitore_id} value={f.fornitore_id}>
              {f.ragione_sociale
                ? f.ragione_sociale || "N/D"
                : `${f.nome} ${f.cognome}`}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={addSelectedFornitore}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex-1 min-w-[120px]"
        >
          Aggiungi
        </button>

        <button
          type="button"
          disabled={!selectedFornitoreId}
          onClick={deleteSelectedFornitore}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium flex-1 min-w-[120px]"
        >
          Elimina
        </button>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex-1 min-w-[120px]"
        >
          Nuovo
        </button>
      </div>

      {/* Tabella fornitori */}
      {addedFornitori.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Nome
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Indirizzo
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  CF/P.IVA
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Attività
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {addedFornitori.map((f, i) => (
                <tr
                  key={f.fornitore_id}
                  className={
                    i % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"
                  }
                >
                  <td className="px-4 py-2">
                    {f.ragione_sociale
                      ? f.ragione_sociale || "N/D"
                      : `${f.nome} ${f.cognome}`}
                  </td>
                  <td className="px-4 py-2">{f.indirizzo}</td>
                  <td className="px-4 py-2">{f.cf}</td>
                  <td className="px-4 py-2">{f.attivita}</td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAddedFornitori(
                          addedFornitori.filter(
                            (item) => item.fornitore_id !== f.fornitore_id,
                          ),
                        )
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuovo fornitore */}
      {showModal && (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // blocca l'invio normale
            addNewFornitore(); // chiama la funzione
          }}
        >
          {" "}
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
              <h4 className="text-lg font-semibold mb-4">Nuovo Fornitore</h4>

              {[
                "ragioneSociale",
                "nome",
                "cognome",
                "cf",
                "attivita",
                "indirizzo",
                "cap",
                "citta",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={
                    field === "Ragione Sociale"
                      ? "Ragione Sociale"
                      : field === "cf"
                        ? "CF / P.IVA"
                        : field === "attivita"
                          ? "Tipo attività"
                          : field === "citta"
                            ? "città"
                            : field
                  }
                  value={newFornitore[field]}
                  onChange={(e) =>
                    setNewFornitore((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-400"
                />
              ))}
              {/* ✅ PROVINCIA - SELECT */}
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-400 bg-white text-gray-400"
                value={newFornitore.provincia}
                onChange={(e) =>
                  setNewFornitore((prev) => ({
                    ...prev,
                    provincia: e.target.value,
                  }))
                }
              >
                <option value="">Seleziona Provincia</option>
                {provinceItaliane.map((provincia) => (
                  <option key={provincia.sigla} value={provincia.sigla}>
                    {provincia.nome} ({provincia.sigla})
                  </option>
                ))}
              </select>

              <div className="flex flex-wrap gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={addNewFornitore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex-1 min-w-[100px]"
                >
                  Salva
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-md flex-1 min-w-[100px]"
                >
                  Chiudi
                </button>
              </div>

              {successMessage && (
                <p className="text-green-600 mt-2 font-medium">
                  {successMessage}
                </p>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
