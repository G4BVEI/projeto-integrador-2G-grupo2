import ProtectedLayout from "@/components/layout/protegido/ProtectedLayout";
export default function protegidolayout({ children }) {
  return (
    <>
      <ProtectedLayout>
          {children}
      </ProtectedLayout>
    </>
  );
}