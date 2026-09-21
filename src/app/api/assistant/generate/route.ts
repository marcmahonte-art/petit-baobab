import { NextResponse } from "next/server";
import { generatePedagogicalContent } from "@/lib/assistant/openai";
import { getTeacherSession } from "@/lib/school-auth";

export async function POST(request: Request) {
  // Authentification AVANT tout appel au modèle : sans cette garde, la route
  // est un proxy IA ouvert — n'importe quel visiteur pouvait générer du contenu
  // aux frais du compte OpenAI. La garde exige aussi le plan École / Pro,
  // cohérent avec la page appelante (/school/assistant).
  const { errorResponse } = await getTeacherSession();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, error: "Requête invalide ou corps de message vide." },
        { status: 400 }
      );
    }

    const toolId = body.tool_id || body.toolId;
    const persona = body.persona;
    const inputValues = body.input_values || body.inputValues || {};

    if (!toolId) {
      return NextResponse.json(
        { success: false, error: "Identifiant de l'outil (tool_id) manquant." },
        { status: 400 }
      );
    }

    if (!persona) {
      return NextResponse.json(
        { success: false, error: "Profil (persona) manquant." },
        { status: 400 }
      );
    }

    const result = await generatePedagogicalContent({
      toolId,
      persona,
      inputValues,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Échec de la génération IA." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      tool_id: result.toolId,
    });
  } catch (err) {
    console.error("[API Assistant Generate] Exception:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors de la génération." },
      { status: 500 }
    );
  }
}
