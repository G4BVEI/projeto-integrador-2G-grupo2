import AuthHeader from "@/components/AuthHeader";
export default function AuthLayout({ children }) {
  return (
    <>
      <AuthHeader />
      {children}
    </>
  );
}
