  "use client";

  export default function LoadingSpinner({ message = "Carregando..." }) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full border-b-2 border-green-600 h-16 w-16" />
          </div>
          <p className="mt-4 text-gray-600">{message}</p>
        </div>
      </div>
    );
  }
