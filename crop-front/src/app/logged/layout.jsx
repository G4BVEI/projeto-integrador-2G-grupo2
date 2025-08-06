import LoggedHeader from "@/components/LoggedHeader";
import Sidebar from "@/components/Sidebar";

export default function LoggedLayout({ children }) {
  return (
    <>
      <LoggedHeader></LoggedHeader>
      <Sidebar></Sidebar>
      {children}
    </>
  );
}