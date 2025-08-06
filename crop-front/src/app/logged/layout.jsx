import LoggedLayout from "@/components/layout/logged/LoggedLayout";
export default function Loggedlayout({ children }) {
  return (
    <>
      <LoggedLayout>
          {children}
      </LoggedLayout>
    </>
  );
}