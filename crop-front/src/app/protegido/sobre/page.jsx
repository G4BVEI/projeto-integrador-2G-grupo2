"use client";

export default function SobrePage() {
  return (
    <div className="p-6">
      {/* Título */}
      <h1 className="text-2xl font-bold mb-2">Sobre O Projeto</h1>
      <p className="text-gray-600 mb-6">
      <div id="sobretexto">
        <p>O CropSense é um projeto criado para ajudar quem está no agronegócio a cuidar melhor de suas lavouras. A proposta é trazer ferramentas que facilitam o dia a dia do campo, como o monitoramento das culturas, a organização das atividades e o acompanhamento do clima.</p>
        <p>Nosso foco está na agricultura de precisão e na sustentabilidade, buscando formas de tornar a produção mais eficiente, reduzir desperdícios e aproveitar melhor os recursos disponíveis.</p>
        <p>A ideia é mostrar como a tecnologia pode ser uma aliada no manejo das lavouras, tornando o trabalho mais prático e preparado para os desafios do futuro.</p></div>
      </p>

      {/* Seção do time */}
      <h2 className="text-xl font-semibold mb-4">Equipe</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de membros */}
        <div className="col-span-2 grid grid-cols-2 gap-6">
          {/* Gabriel */}
          <div className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/gabriel.png" alt="Gabriel" className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-medium">Gabriel da Veiga</p>
          </div>

          {/* Caroline */}
          <div className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="../carolindadiva.png" alt="Caroline" className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-medium">Caroline França</p>
          </div>

          {/* Thiago */}
          <div className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/thiago.png" alt="Thiago" className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-medium">Thiago Segalla</p>
          </div>

          {/* Arthur */}
          <div className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/arthur.png" alt="Arthur" className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-medium">Arthur Sobral</p>
          </div>

          {/* Luan */}
          <div className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="../martinitocandogaita.png" alt="Luan" className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-medium">Luan Martini</p>
          </div>

          {/* Matheus */}
          <div className="flex flex-col items-center border-2 border-gray-300 rounded-2xl p-4 hover:shadow-md transition">
            <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/matheus.png" alt="Matheus" className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 font-medium">Matheus Polinski</p>
          </div>
        </div>

        {/* Card grande à direita */}
        <div className="col-span-1 border-2 border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="w-30 h-45 bg-gray-200 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
            <img
              src="../logoifc.png"
              alt="Logo IFC"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-center text-gray-600">
            Instituto Federal Catarinense
            <br />
            <span className="font-semibold">Campus Concórdia</span>
          </p>
        </div>
      </div>
    </div>
  );
}
