export default function LoggedLayout({ children }) {
  return (
    <>
      <header className="w-full py-4 bg-white bg-opacity-80 text-center shadow-md">
        <h1 className="text-2xl font-semibold text-green-600">Mude app/logged/layout para mudar esse header</h1>
      </header>
      <aside><div><p>batata</p></div> </aside>
      {children}
    </>
  );
}
