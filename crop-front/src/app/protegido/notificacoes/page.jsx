export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationItem from "@/components/notification/NotificationItem";
import LoadingSpinner from "@/components/layout/LoadingSpinner"; // make sure path is correct

export default async function NotificationsPage() {
  const supabase = createClient();

  // Get user session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (!session || sessionError) {
    redirect("/auth/login");
  }

  // Fetch notifications
  const { data: notifications, error: notificationsError } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("criado_em", { ascending: false });

  if (notificationsError) {
    console.error("Erro ao buscar notificações:", notificationsError);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <div className="flex gap-3">
          <Link
            href="/protegido/dashboard"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Voltar ao Dashboard
          </Link>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Marcar todas como lidas
          </button>
        </div>
      </div>

      {/* Lista de notificações */}
      {!notifications ? (
        <LoadingSpinner message="Carregando notificações..." />
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma notificação encontrada.</p>
      )}
    </div>
  );
}
