import { NextResponse } from "next/server";

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

  const body = await request.json().catch(() => null);
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  const style = allowedStyles.includes(body?.style)
    ? (body.style as MagicDrawingStyle)
    : "noir_blanc";

  if (!idea) {
    return NextResponse.json(
      { error: "Décris d'abord le dessin à créer." },
      { status: 400 }
    );
  }

  const prompt = buildColoringPrompt(idea.slice(0, 200), style);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "medium",
      n: 1,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.error?.message ||
          "Impossible de créer le dessin pour le moment.",
      },
      { status: response.status }
    );
  }

  const image = data?.data?.[0]?.b64_json;

  if (!image) {
    return NextResponse.json(
      { error: "Aucune image n'a été renvoyée." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    imageUrl: `data:image/png;base64,${image}`,
    prompt,
    style: {
      id: style,
      description: styleConfig[style].description,
      guidance_scale: styleConfig[style].guidance_scale,
      num_inference_steps: styleConfig[style].num_inference_steps,
    },
  });
}


