import { NextResponse } from "next/server";
import { getSheetById, updateSheetPaths, isContentTextual } from "@/lib/assistant/queries";
import { generatePedagogicalDocxBuffer } from "@/lib/assistant/exportWord";
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const sheetId = url.searchParams.get("sheet_id");

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

    // 2. Contrôle de l'exportation textuelle
    if (!isContentTextual(sheet.tool_id)) {
      return NextResponse.json(
        { success: false, error: "Cet outil ne prend pas en charge l'exportation au format Word." },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServer();
    const folderId = sheet.account_id || sheet.teacher_id;
    const filePath = `${folderId}/${sheet.id}/fiche.docx`;
    const expiresIn = 3600; // 1 heure

    // 3. Si le fichier .docx existe déjà dans le storage et est enregistré dans la table
    if (sheet.docx_path) {
      const { data: signedData, error: signErr } = await supabase.storage
        .from("assistant-exports")
        .createSignedUrl(sheet.docx_path, expiresIn);

      if (!signErr && signedData?.signedUrl) {
        return NextResponse.json({
          success: true,
          downloadUrl: signedData.signedUrl,
          title: sheet.title,
        });
      }
    }

    // 4. Sinon, générer le buffer Word avec la librairie docx
    const docxBuffer = await generatePedagogicalDocxBuffer(sheet);

    // 5. Upload dans le bucket Supabase Storage "assistant-exports"
    const { error: uploadErr } = await supabase.storage
      .from("assistant-exports")
      .upload(filePath, docxBuffer, {
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: true,
      });

    if (uploadErr) {
      console.warn("[Word Export API] Storage upload warning (fallback URL returned):", uploadErr.message);
    } else {
      // Mettre à jour docx_path dans la table
      await updateSheetPaths(sheet.id, { docx_path: filePath });
    }

    // 6. Générer l'URL signée pour le téléchargement
    const { data: signedData, error: signErr } = await supabase.storage
      .from("assistant-exports")
      .createSignedUrl(filePath, expiresIn);

    if (signErr || !signedData?.signedUrl) {
      // Fallback direct download si bucket non disponible
      return new NextResponse(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="Petit_Baobab_${sheet.id.slice(0, 8)}.docx"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      downloadUrl: signedData.signedUrl,
      title: sheet.title,
    });
  } catch (err: any) {
    console.error("[Word Export API Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur de génération du fichier Word." },
      { status: 500 }
    );
  }
}
