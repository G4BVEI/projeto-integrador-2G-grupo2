import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  return (
   <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
  <img
    src="https://media.canva.com/v2/image-resize/format:PNG/height:628/quality:100/uri:ifs%3A%2F%2FM%2Faad36b86-ddb6-41a0-8745-38428e3c640e/watermark:F/width:1200?csig=AAAAAAAAAAAAAAAAAAAAAL6d-mhjhiKC3f7PE69DzYbesQcxK6rsVuaj32_-8jNU&exp=1752095309&osig=AAAAAAAAAAAAAAAAAAAAAPT6x4j5x8O-297fe1LFQ7stwsuJzdOjrdQj2UULtmzS&signer=media-rpc&x-canva-quality=screen_2x"
    alt="Fundo"
    className="absolute inset-0 w-full h-full object-cover -z-10"
  />

      <div className="bg-white bg-opacity-90 p-6 rounded-xl shadow-xl w-100% max-w-md">
        <h2 className="text-2xl font-semibold text-green-600 text-center mb-6">Crie uma conta</h2>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
          />

          <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition">
            Cadastrar-se
          </button>
        </form>

        <p className="text-center text-sm mt-2">
          Já possui uma conta?{' '}
          <a href="#" className="text-green-600 hover:underline">
            Clique aqui
          </a>
        </p>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-sm text-gray-500">Ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button className="w-full flex items-center justify-center border py-2 rounded-full bg-white shadow hover:shadow-md transition">
          <FcGoogle className="text-xl mr-2" />
          Continue com o Google
        </button>
      </div>
    </div>
  );
};

export default Login;
