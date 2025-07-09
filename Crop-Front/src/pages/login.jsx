import React from "react";

const Cadastro = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Imagem de fundo */}
      <img
        src="https://media.canva.com/v2/image-resize/format:PNG/height:628/quality:100/uri:ifs%3A%2F%2FM%2Faad36b86-ddb6-41a0-8745-38428e3c640e/watermark:F/width:1200?csig=AAAAAAAAAAAAAAAAAAAAALOz2JX0KyHndDIt3CxHdWa6HDfR5ntbDapEfY9cAoDi&exp=1752098909&osig=AAAAAAAAAAAAAAAAAAAAAD7_-63XZdUyEz0q6A-Rj1AnG6Ai4taJ7Ihi18Ly7h9t&signer=media-rpc&x-canva-quality=screen_2x"
        alt="Fundo"
        className="absolute inset-0 w-full h-full object-cover -z-10"
      />

      {/* Cabeçalho */}
      <header className="w-full py-4 bg-white bg-opacity-80 text-center shadow">
        <h1 className="text-2xl font-semibold text-green-600">CropSense</h1>
      </header>

      {/* Formulário centralizado */}
      <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] px-4">
        <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md w-full max-w-md border border-gray-300">
          <h2 className="text-2xl font-medium text-green-600 text-center mb-4">
            Crie uma conta
          </h2>

          <form className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-4 py-2 border rounded-md bg-gray-100 outline-none"
            />
            <input
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-2 border rounded-md bg-gray-100 outline-none"
            />
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-medium"
            >
              Cadastrar-se
            </button>
          </form>

          <p className="text-center text-sm mt-2">
            Já possui uma conta?{" "}
            <a href="#" className="text-green-600 hover:underline">
              Clique aqui
            </a>
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center w-full max-w-md my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">Ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Botão Google */}
        <button className="flex items-center gap-2 border px-6 py-2 rounded-full bg-white shadow hover:shadow-md transition text-sm">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue com o Google
        </button>
      </div>
    </div>
  );
};

export default Cadastro;
