import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div>

        <h3>Ent pessoal aq os links por enquanto</h3>
        <Link href="/" className="text-blue-500 underline">Esse mesmo</Link>
        <br></br>
        <Link href="/auth/login" className="text-blue-500 underline">login</Link>
        <br></br>
        <Link href="/auth/cadastro" className="text-blue-500 underline">cadastro</Link>
        <br></br>
        <Link href="/logged/dashboard" className="text-blue-500 underline">mathias fazer</Link>
      </div>
    </div>
  );
}
