import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getServerUser, adjustStars, STARS_REASONS } from "@/lib/auth";

type MagicDrawingStyle =
  | "noir_blanc"
  | "contour_simple"
  | "dessin_detaille"
  | "version_couleur";

const allowedStyles: MagicDrawingStyle[] = [
  "noir_blanc",
  "contour_simple",
  "dessin_detaille",
  "version_couleur",
];

const styleCosts: Record<MagicDrawingStyle, number> = {
  contour_simple: 1,
  noir_blanc: 1,
  dessin_detaille: 3,
  version_couleur: 3,
};

const negativePrompt = `realistic photo, 3D render, shading,
gray fills, dark background, scary, violence,
adult content, text, watermark, signature,
complex background, multiple scenes, blurry`;

const styleConfig: Record<
  MagicDrawingStyle,
  {
    guidance_scale: number;
    num_inference_steps: number;
    prompt_suffix: string;
    description: string;
  }
> = {
  noir_blanc: {
    guidance_scale: 7.5,
    num_inference_steps: 28,
    prompt_suffix: "black and white only, no color",
    description: "Coloriage Noir & Blanc",
  },
  contour_simple: {
    guidance_scale: 6.0,
    num_inference_steps: 20,
    prompt_suffix: "simple thick outlines, minimal detail",
    description: "Contour simple",
  },
  dessin_detaille: {
    guidance_scale: 8.5,
    num_inference_steps: 35,
    prompt_suffix: "detailed intricate coloring page",
    description: "Dessin détaillé",
  },
  version_couleur: {
    guidance_scale: 7.0,
    num_inference_steps: 30,
    prompt_suffix: "colorful vibrant flat illustration",
    description: "Version couleur",
  },
};

function buildColoringPrompt(idea: string, style: MagicDrawingStyle) {
  const base = `black and white coloring page for children aged 3-7,
thick clean outlines only, no shading, no gray fills,
white background, single centered illustration,
simple and clear shapes, child-friendly, safe content`;

  const styleMap: Record<MagicDrawingStyle, string> = {
    noir_blanc: `${base},
classic coloring book style, bold black outlines,
flat white interior areas ready to color`,

    contour_simple: `${base},
minimal line art, very simple thick outlines,
large easy-to-color areas, cartoon style`,

    dessin_detaille: `${base},
detailed coloring page, intricate patterns inside shapes,
decorative elements, slightly complex for older children`,

    version_couleur: `${idea} illustration for children,
colorful, vibrant, flat color style, cartoon,
no outlines needed, bright african-inspired palette,
safe and fun, centered composition`,
  };

  const stylePrompt = styleMap[style] || styleMap.noir_blanc;
  const config = styleConfig[style] || styleConfig.noir_blanc;

  return `${stylePrompt}, subject: ${idea},
${config.prompt_suffix},
african setting when relevant, Petit Baobab style,
no text, no letters, no watermark, square format,
avoid: ${negativePrompt}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "La clé OPENAI_API_KEY est manquante." },
      { status: 500 }
    );
  }

  // 1. Authenticate user
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Veuillez vous connecter pour créer un dessin magique." },
      { status: 401 }
    );
  }

  // 2. Fetch the linked account
  const { data: account, error: accError } = await supabase
    .from("accounts")
    .select("id, stars_balance, plan")
    .eq("user_id", user.id)
    .single();

  if (accError || !account) {
    return NextResponse.json(
      { error: "no_account", message: "Compte parent introuvable." },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  const style = allowedStyles.includes(body?.style)
    ? (body.style as MagicDrawingStyle)
    : "noir_blanc";
  const profileId = typeof body?.profileId === "string" ? body.profileId.trim() : "";

  if (!idea) {
    return NextResponse.json(
      { error: "Décris d'abord le dessin à créer." },
      { status: 400 }
    );
  }

  if (!profileId) {
    return NextResponse.json(
      { error: "Veuillez sélectionner un profil enfant actif." },
      { status: 400 }
    );
  }

  const cost = styleCosts[style];

  // 3. Check stars balance
  if (account.stars_balance < cost) {
    return NextResponse.json(
      {
        error: "insufficient_stars",
        message: "Plus assez d'étoiles pour ce dessin. Découvrez nos packs ou patientez jusqu'au renouvellement du mois prochain.",
        plan: account.plan,
      },
      { status: 403 }
    );
  }

  // 4. Generate drawing ID & deduct stars balance
  const drawingId = crypto.randomUUID();
  const debitResult = await adjustStars(account.id, -cost, STARS_REASONS.GENERATION, drawingId);

  if (!debitResult.success) {
    return NextResponse.json(
      { error: "transaction_failed", message: debitResult.error || "La transaction d'étoiles a échoué." },
      { status: 500 }
    );
  }

  // 5. Insert drawing log with status 'en_cours'
  const { error: insertErr } = await supabase
    .from("drawings")
    .insert({
      id: drawingId,
      profile_id: profileId,
      image_url: "",
      origin: "ia",
      style: style,
      stars_cost: cost,
      status: "en_cours",
    });

  if (insertErr) {
    console.error("Failed to log drawing insertion:", insertErr.message);
  }

  // 6. Request AI Generation from OpenAI
  const prompt = buildColoringPrompt(idea.slice(0, 200), style);
  let response;

  try {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
        prompt,
        size: "1024x1024",
        response_format: "b64_json",
        n: 1,
      }),
    });
  } catch (err: any) {
    console.error("OpenAI generation fetch failed:", err);
  }

  const data = response ? await response.json().catch(() => null) : null;

  if (!response?.ok || !data?.data?.[0]?.b64_json) {
    const errorMsg = data?.error?.message || "Impossible de créer le dessin pour le moment.";
    console.error("Generation failed. Refunding stars and logging error...", errorMsg);

    // Refund stars
    await adjustStars(account.id, cost, STARS_REASONS.REFUND, drawingId);

    // Update drawing status to 'erreur'
    await supabase
      .from("drawings")
      .update({ status: "erreur" })
      .eq("id", drawingId);

    return NextResponse.json(
      { error: errorMsg },
      { status: response ? response.status : 502 }
    );
  }

  const base64Image = data.data[0].b64_json;
  let finalImageUrl = `data:image/png;base64,${base64Image}`;

  // 7. Upload generated image to Supabase Storage
  try {
    const buffer = Buffer.from(base64Image, "base64");
    const filePath = `${profileId}/${drawingId}.png`;

    const { error: uploadError } = await supabase.storage
      .from("drawings")
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from("drawings")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        finalImageUrl = urlData.publicUrl;
      }
    } else {
      console.error("Storage upload failed, falling back to base64 URL:", uploadError.message);
    }
  } catch (uploadErr) {
    console.error("Failed to upload image during generation:", uploadErr);
  }

  // 8. Update drawing status to 'terminé'
  await supabase
    .from("drawings")
    .update({
      image_url: finalImageUrl,
      status: "terminé",
    })
    .eq("id", drawingId);

  // 9. Return success
  return NextResponse.json({
    success: true,
    imageUrl: finalImageUrl,
    drawingId,
    newBalance: debitResult.newBalance,
    prompt,
    style: {
      id: style,
      description: styleConfig[style].description,
      guidance_scale: styleConfig[style].guidance_scale,
      num_inference_steps: styleConfig[style].num_inference_steps,
    },
  });
}
