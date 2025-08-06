import AuthHeader from "@/components/layout/auth/AuthHeader";
export default function AuthLayout({ children }) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
