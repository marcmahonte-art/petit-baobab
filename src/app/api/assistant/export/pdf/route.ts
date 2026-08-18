import { NextResponse } from "next/server";
import { getSheetById, updateSheetPaths } from "@/lib/assistant/queries";
import { generatePedagogicalPdfBuffer } from "@/lib/assistant/exportPdf";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sheetId = url.searchParams.get("sheet_id");
    const isShare = url.searchParams.get("share") === "true";

    if (!sheetId) {
      return NextResponse.json(
        { success: false, error: "Identifiant de fiche (sheet_id) manquant." },
        { status: 400 }
      );
    }

    // 1. Récupération de la fiche en base
    const { data: sheet, error: fetchErr } = await getSheetById(sheetId);
    if (fetchErr || !sheet) {
      return NextResponse.json(
        { success: false, error: "Fiche pédagogique introuvable." },
        { status: 404 }
      );
    }

    const supabase = await getSupabaseServer();
    const folderId = sheet.account_id || sheet.teacher_id;
    const filePath = `${folderId}/${sheet.id}/fiche.pdf`;
    const expiresIn = isShare ? 604800 : 3600; // 7 jours pour WhatsApp, 1h pour téléchargement direct

    // 2. Si le PDF existe déjà dans le storage et est enregistré dans la table
    if (sheet.pdf_path) {
      const { data: signedData, error: signErr } = await supabase.storage
        .from("assistant-exports")
        .createSignedUrl(sheet.pdf_path, expiresIn);

      if (!signErr && signedData?.signedUrl) {
        return NextResponse.json({
          success: true,
          downloadUrl: signedData.signedUrl,
          title: sheet.title,
        });
      }
    }

    // 3. Sinon, générer le buffer PDF avec jsPDF
    const pdfBuffer = generatePedagogicalPdfBuffer(sheet);

    // 4. Upload dans le bucket Supabase Storage "assistant-exports"
    const { error: uploadErr } = await supabase.storage
      .from("assistant-exports")
      .upload(filePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      console.warn("[PDF Export API] Storage upload warning (fallback URL returned):", uploadErr.message);
    } else {
      // Mettre à jour pdf_path dans la table
      await updateSheetPaths(sheet.id, { pdf_path: filePath });
    }

    // 5. Générer l'URL signée pour le téléchargement
    const { data: signedData, error: signErr } = await supabase.storage
      .from("assistant-exports")
      .createSignedUrl(filePath, expiresIn);

    if (signErr || !signedData?.signedUrl) {
      // Fallback si bucket non configuré sur Supabase : retour du buffer directement en téléchargement PDF
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Petit_Baobab_${sheet.id.slice(0, 8)}.pdf"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedData.signedUrl,
      title: sheet.title,
    });
  } catch (err: any) {
    console.error("[PDF Export API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur de génération du PDF." },
      { status: 500 }
    );
  }
}
