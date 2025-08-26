"use client";

import { useState, useEffect } from "react";

export default function SobrePage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);

  // Simulando fetch dos membros (poderia vir de API futuramente)
  useEffect(() => {
    setTimeout(() => {
      setTeam([
        { id: 1, nome: "Gabriel" },
        { id: 2, nome: "Caroline" },
        { id: 3, nome: "Thiago" },
        { id: 4, nome: "Arthur" },
        { id: 5, nome: "Luan" },
        { id: 6, nome: "Matheus" },
      ]);
      setLoading(false);
    }, 500); // meio segundo só pra simular carregamento
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Sobre</h1>
        <p className="text-gray-600 mb-6">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Título */}
      <h1 className="text-2xl font-bold mb-2">Sobre</h1>
      <p className="text-gray-600 mb-6">Saiba mais sobre o nosso projeto</p>

      {/* Seção do time */}
      <h2 className="text-xl font-semibold mb-4">O Time</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de membros */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {team.map((membro) => (
            <div
              key={membro.id}
              className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-500">Foto</span>
              </div>
              <p className="mt-2 font-medium">{membro.nome}</p>
            </div>
          ))}
        </div>

        {/* Card grande à direita */}
        <div className="col-span-1 border-2 border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="w-40 h-52 bg-gray-200 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-gray-500">Imagem</span>
          </div>
          <p className="text-center text-gray-600">
            Este espaço pode ser usado para descrever o projeto, missão da
            equipe ou até destacar algum integrante.
          </p>
        </div>
      </div>
    </div>
  );
}