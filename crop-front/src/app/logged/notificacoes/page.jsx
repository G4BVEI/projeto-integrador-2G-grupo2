import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NotificationItem from "@/components/notification/NotificationItem";

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Buscar notificações do usuário logado
  const { data: notifications } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", session.user.id)
    .order("criado_em", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notificações</h1>
        <div className="flex gap-3">
          <Link
            href="dashboard"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
          >
            Voltar ao Dashboard
          </Link>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Marcar todas como lidas
          </button>
        </div>
      </div>

      {/* Lista de notificações */}
      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))
        ) : (
          <p className="text-gray-500">Nenhuma notificação encontrada.</p>
        )}
      </div>
    </div>
  );
}