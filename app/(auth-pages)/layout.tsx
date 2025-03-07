import { ReactNode } from "react";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-sm p-6 border border-border">
        {children}
      </div>
    </div>
  );
}
