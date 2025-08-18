import AuthHeader from "@/components/layout/Auth";
export default function AuthLayout({ children }) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
