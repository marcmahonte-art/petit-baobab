import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type ColoringBookPage = {
  imageUrl: string;
  idea: string;
  style: string;
  createdAt: string;
};

type ColoringBook = {
  userId: string;
  pages: ColoringBookPage[];
};

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "coloring-books.json");
const uploadDir = path.join(
  process.cwd(),
  "public",
  "generated",
  "coloring-books"
);

function sanitizeSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function readBooks(): Promise<ColoringBook[]> {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw) as ColoringBook[];
  } catch {
    return [];
  }
}

async function writeBooks(books: ColoringBook[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(books, null, 2), "utf8");
}

async function uploadToStorage(imageUrl: string, userId: string) {
  await mkdir(uploadDir, { recursive: true });

  const safeUserId = sanitizeSegment(userId) || "demo-user";
  const filename = `${safeUserId}-${Date.now()}.png`;
  const absolutePath = path.join(uploadDir, filename);

  if (imageUrl.startsWith("data:image/")) {
    const base64 = imageUrl.split(",")[1];

    if (!base64) {
      throw new Error("L'image fournie est invalide.");
    }

    await writeFile(absolutePath, Buffer.from(base64, "base64"));
    return `/generated/coloring-books/${filename}`;
  }

  const url = new URL(imageUrl);

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Seules les images http, https ou data URL sont autorisées.");
  }

  const response = await fetch(url, {
    headers: {
      Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de sauvegarder l'image.");
  }

  const buffer = await response.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(buffer));

  return `/generated/coloring-books/${filename}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const userId =
    typeof body?.userId === "string" && body.userId.trim()
      ? body.userId.trim()
      : "demo-user";
  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : "";
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  const style = typeof body?.style === "string" ? body.style.trim() : "";

  if (!imageUrl || !idea || !style) {
    return NextResponse.json(
      { error: "imageUrl, idea et style sont obligatoires." },
      { status: 400 }
    );
  }

  try {
    const permanentUrl = await uploadToStorage(imageUrl, userId);
    const books = await readBooks();
    const page: ColoringBookPage = {
      imageUrl: permanentUrl,
      idea: idea.slice(0, 200),
      style,
      createdAt: new Date().toISOString(),
    };

    const existingBook = books.find((book) => book.userId === userId);

    if (existingBook) {
      existingBook.pages.push(page);
    } else {
      books.push({ userId, pages: [page] });
    }

    await writeBooks(books);

    const currentBook = books.find((book) => book.userId === userId);

    return NextResponse.json({
      success: true,
      imageUrl: permanentUrl,
      totalPages: currentBook?.pages.length || 1,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible d'ajouter le dessin au livre.",
      },
      { status: 500 }
    );
  }
}
