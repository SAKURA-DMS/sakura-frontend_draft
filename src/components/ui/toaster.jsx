import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport,} 
from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, className, ...props }) {
        return (
          <Toast 
            key={id} 
            {...props} 
            // Tambahan shadow-2xl dan border agar pop-up sangat menonjol
            className={`shadow-2xl border-2 border-border rounded-xl ${className || ""}`}
          >
            <div className="grid gap-1">
              {title && <ToastTitle className="text-base font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="opacity-90 font-medium">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="hover:bg-muted/50 rounded-md p-1" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}