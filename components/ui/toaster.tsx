"use client";

import * as React from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const item: ToastItem = {
        id,
        title: input.title,
        description: input.description,
        variant: input.variant ?? "default"
      };

      setToasts((current) => [item, ...current].slice(0, 4));
      window.setTimeout(() => removeToast(id), 5000);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 top-20 z-[80] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((item) => {
          const Icon = item.variant === "success" ? CheckCircle2 : item.variant === "error" ? XCircle : Info;

          return (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border bg-background p-4 text-foreground shadow-lg",
                item.variant === "success" && "border-green-600/40",
                item.variant === "error" && "border-red-600/40"
              )}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    item.variant === "success" && "text-brand-green",
                    item.variant === "error" && "text-brand-red",
                    item.variant === "default" && "text-brand-blue"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.description ? <p className="mt-1 text-sm text-muted-foreground">{item.description}</p> : null}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeToast(item.id)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss notification</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
