"use client";

import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { StudentLoginForm } from "@/components/auth/StudentLoginForm";

export default function StudentLoginPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-[#6D4CFF] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <StudentLoginForm />
      </Suspense>
    </AuthLayout>
  );
}
