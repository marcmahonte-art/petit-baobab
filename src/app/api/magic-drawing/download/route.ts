import { NextRequest, NextResponse } from "next/server";

function sanitizeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "mon-coloriage";
}

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("imageUrl");
  const filename = sanitizeFilename(
    request.nextUrl.searchParams.get("filename") || "mon-coloriage"
  );

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Le paramètre imageUrl est obligatoire." },
      { status: 400 }
    );
  }

  let url: URL;

  try {
    url = new URL(imageUrl);
  } catch {
    return NextResponse.json(
      { error: "L'URL de l'image est invalide." },
      { status: 400 }
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return NextResponse.json(
      { error: "Seules les URLs http et https sont autorisées." },
      { status: 400 }
    );
  }

  const imageResponse = await fetch(url, {
    headers: {
      Accept: "image/png,image/*;q=0.8,*/*;q=0.5",
    },
  });

  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Impossible de télécharger l'image." },
      { status: imageResponse.status }
    );
  }

  const buffer = await imageResponse.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": imageResponse.headers.get("Content-Type") || "image/png",
      "Content-Disposition": `attachment; filename="${filename}.png"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
