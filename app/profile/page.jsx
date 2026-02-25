"use client";

import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout"; // importa qui

export default function ProfilePage() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Nessun utente loggato.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6 text-gray-600">
        {/* Dati Generali */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">
            Dati Generali
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Nome
              </label>
              <p className="mt-1 text-gray-800">{user.name}</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Cognome
              </label>
              <p className="mt-1 text-gray-800">{user.cognome ?? "-"}</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Email
              </label>
              <p className="mt-1 text-gray-800">{user.email ?? "-"}</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Telefono
              </label>
              <p className="mt-1 text-gray-800">{user.telefono ?? "-"}</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Ragione Sociale
              </label>
              <p className="mt-1 text-gray-800">
                {user.ragione_sociale ?? "-"}
              </p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Partita IVA
              </label>
              <p className="mt-1 text-gray-800">{user.partita_iva ?? "-"}</p>
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Codice Univoco
              </label>
              <p className="mt-1 text-gray-800">{user.codice_univoco ?? "-"}</p>
            </div>
          </div>
        </div>

        {/* Sedi */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 mb-2">Sedi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sede Legale */}
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Sede Legale
              </label>
              <p className="mt-1 text-gray-800">{user.sede_legale ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                CAP
              </label>
              <p className="mt-1 text-gray-800">{user.cap_legale ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Città
              </label>
              <p className="mt-1 text-gray-800">{user.citta_legale ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Provincia
              </label>
              <p className="mt-1 text-gray-800">{user.pr_legale ?? "-"}</p>
            </div>

            {/* Sede Operativa */}
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Sede Operativa
              </label>
              <p className="mt-1 text-gray-800">{user.sede_operativa ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                CAP
              </label>
              <p className="mt-1 text-gray-800">{user.cap_operativa ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Città
              </label>
              <p className="mt-1 text-gray-800">
                {user.citta_operativa ?? "-"}
              </p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Provincia
              </label>
              <p className="mt-1 text-gray-800">{user.pr_operativa ?? "-"}</p>
            </div>

            {/* Studio */}
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Indirizzo Studio
              </label>
              <p className="mt-1 text-gray-800">
                {user.indirizzo_studio ?? "-"}
              </p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                CAP Studio
              </label>
              <p className="mt-1 text-gray-800">{user.cap_studio ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Città Studio
              </label>
              <p className="mt-1 text-gray-800">{user.citta_studio ?? "-"}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium">
                Provincia Studio
              </label>
              <p className="mt-1 text-gray-800">{user.pr_studio ?? "-"}</p>
            </div>
          </div>
        </div>

        {/* Azioni */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/profile/edit")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Modifica Profilo
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
