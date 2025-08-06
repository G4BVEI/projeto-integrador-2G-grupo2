import LoggedLayout from "@/components/LoggedLayout";
export default function Loggedlayout({ children }) {
  return (
    <>
      <LoggedLayout>
          {children}
      </LoggedLayout>
    </>
  );
}