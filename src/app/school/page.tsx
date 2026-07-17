"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchoolIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/school/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
      <div className="animate-spin rounded-full border-4 border-[#7D6AF8] border-t-transparent h-12 w-12" />
    </div>
  );
}
