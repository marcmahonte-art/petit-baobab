import { notFound } from "next/navigation";
import { memoryBookService } from "@/features/memory-book/services/memoryBookService";
import { BookPrint } from "@/features/memory-book/components/editor/BookPrint";

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrintPage({ params }: PrintPageProps) {
  const { id } = await params;
  const book = await memoryBookService.getById(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="print-only">
      <BookPrint book={book} />
    </div>
  );
}
