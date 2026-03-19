import { useToastStore } from '../store/toastStore';

function Toast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismissToast = useToastStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed left-0 right-0 top-16 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={`rounded-xl bg-text-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg ${
            toast.leaving ? 'animate-toast-out' : 'animate-toast-in'
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}

export default Toast;
