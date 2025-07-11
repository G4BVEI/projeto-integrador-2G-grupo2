"use client"
export default function RegisterForm() {
    return (
  <div className="flex flex-col items-center justify-center h-[calc(100%-4rem)] px-4">
    <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-md w-full max-w-md border border-gray-300">
      <h2 className="text-2xl font-medium text-green-600 text-center mb-4">
        Crie uma conta
      </h2>
      <form className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          className="w-full px-4 py-2 border rounded-md bg-gray-100 outline-none text-gray-700"
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full px-4 py-2 border rounded-md bg-gray-100 outline-none text-gray-700"
        />
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-medium"
        >
          Cadastrar-se
        </button>
      </form>

      <p className="text-center text-sm mt-2 text-gray-500">
        Já possui uma conta?{" "}
        <a href="#" className="text-green-600 hover:underline ">
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
    <button className="flex items-center gap-2 border px-6 py-2 rounded-full bg-white shadow hover:shadow-md transition text-sm text-gray-500">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continue com o Google
    </button>
  </div>
    );
}
