import type { Metadata } from "next";
import ParentsSpace from "@/components/parents/ParentsSpace";

export const metadata: Metadata = {
  title: "Espace parents",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ParentsSpace />;
}
