import { NextResponse } from "next/server";
import { filterContent } from "@/lib/ai/learning-coach";

const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `Tu es l'assistant d'aide de Petit Baobab, une plateforme éducative et créative pour enfants inspirée de l'Afrique (coloriages, livres personnalisés, histoires, dessin magique, jeux, boutique).
Règles :
- Réponds en français, de façon courte (1 à 3 phrases), chaleureuse et bienveillante.
- Aide sur : inscription et prise en main, formules et tarifs, paiement (Orange Money, Moov Money), téléchargement des livres PDF, compte et mot de passe, boutique, coloriage, espace école/enseignants.
- Oriente vers les pages utiles : /tarification, /boutique, /confidentialite, /fonctionnalites.
- Ne donne jamais de conseil médical, financier ou dangereux. Reste dans le sujet Petit Baobab.`;

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

async function chat(messages: ChatMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages,
        temperature: 0.5,
        max_tokens: 160,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch {
    return null;
  }
}

const FAQ: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["commencer", "inscrire", "inscription", "créer un compte", "démarrer", "première fois", "gratuit"],
    answer:
      "Pour commencer, c'est gratuit : clique sur « Commencer gratuitement » en haut à droite, crée ton compte parent en quelques secondes, et ton enfant peut déjà colorier et créer ses premiers livres. Aucune carte bancaire n'est demandée.",
  },
  {
    keywords: ["tarif", "prix", "formule", "abonnement", "coût", "combien", "étoile", "offre", "plan"],
    answer:
      "Nous proposons plusieurs formules (Découverte gratuite, Super Baobab et Espace École) avec des étoiles pour créer sans limites. Tu trouveras tous les détails et prix sur la page Tarifs : /tarification.",
  },
  {
    keywords: ["payer", "paiement", "orange money", "moov", "mobile money", "carte bancaire", "payer par"],
    answer:
      "Le paiement se fait simplement via Orange Money ou Moov Money, sans carte bancaire. Suis le lien de paiement après avoir choisi ta formule ou un produit de la boutique.",
  },
  {
    keywords: ["télécharger", "téléchargement", "pdf", "livre", "imprimer", "impression", "recevoir", "email", "mail"],
    answer:
      "Après un achat, ton livre PDF est disponible immédiatement par email et dans ton espace « Mes achats ». Tu peux le télécharger et l'imprimer chez toi quand tu veux.",
  },
  {
    keywords: ["mot de passe", "connexion", "identifiant", "oublié", "compte bloqué", "reinitialiser", "réinitialiser"],
    answer:
      "Si tu ne parviens pas à te connecter, utilise « Mot de passe oublié » sur la page Connexion pour recevoir un lien de réinitialisation par email.",
  },
  {
    keywords: ["boutique", "sticker", "t-shirt", "tshirt", "produit", "commander", "acheter"],
    answer:
      "La boutique propose livres de coloriage, color by number, t-shirts et stickers inspirés de l'Afrique, à télécharger ou commander. Explore-la ici : /boutique.",
  },
  {
    keywords: ["coloriage", "dessin magique", "colorier", "activité", "enfant"],
    answer:
      "Ton enfant peut colorier en ligne des centaines de dessins, essayer le dessin magique ou créer son propre livre. Rendez-vous sur /coloriage pour commencer.",
  },
  {
    keywords: ["école", "enseignant", "professeur", "classe", "élève", "établissement", "espace école"],
    answer:
      "L'Espace École permet aux enseignants de gérer classes et élèves et de suivre les progrès. Contacte-nous pour activer cet espace sur ton compte.",
  },
  {
    keywords: ["contact", "whatsapp", "aide", "parler", "humain", "équipe", "support"],
    answer:
      "Notre équipe reste joignable sur WhatsApp pour toute question. Tu peux aussi consulter la page Tarifs ou la Boutique selon ta demande.",
  },
  {
    keywords: ["confidentialité", "donnée", "enfant", "sécurité", "rgpd", "privé"],
    answer:
      "La protection des enfants est notre priorité : les données sont sécurisées et jamais revendues. Notre politique est expliquée ici : /confidentialite.",
  },
];

function faqAnswer(message: string): string | null {
  const m = message.toLowerCase();
  for (const item of FAQ) {
    if (item.keywords.some((k) => m.includes(k))) return item.answer;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json({ error: "Message vide" }, { status: 400 });
    }
    if (content.length > 300) {
      return NextResponse.json({ error: "Message trop long" }, { status: 400 });
    }

    const faq = faqAnswer(content);
    if (faq) {
      return NextResponse.json({ reply: faq, source: "faq" });
    }

    const raw = await chat([
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Question visiteur : « ${content.slice(0, 220)} ». Réponds de façon concise et utile.`,
      },
    ]);

    const clean = filterContent(raw);
    if (clean) {
      return NextResponse.json({ reply: clean, source: "ai" });
    }

    return NextResponse.json({
      reply:
        "Je n'ai pas la réponse exacte tout de suite, mais notre équipe est joignable sur WhatsApp. Tu peux aussi consulter la page Tarifs (/tarification) ou la Boutique (/boutique).",
      source: "fallback",
    });
  } catch (err) {
    console.error("Help API error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
