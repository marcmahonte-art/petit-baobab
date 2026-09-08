import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const printUrl = `${baseUrl}/learn/souvenirs/${id}/imprimer`;

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(printUrl, { waitUntil: "networkidle" });

    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      preferCSSPageSize: true,
    });

    await browser.close();

    const pdfData = new Uint8Array(
      Array.from(pdfBuffer as unknown as Buffer)
    );

    return new Response(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cahier-souvenirs-${id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Erreur génération PDF:", err);
    return NextResponse.json(
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
