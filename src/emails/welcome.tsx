// Template email de bienvenue (inscription email + Google OAuth).
export function welcomeHtml(email: string, name: string): string {
  const displayName = name && name.trim() ? name : email.split("@")[0];
  return `
  <!doctype html>
  <html lang="fr">
    <body style="margin:0;padding:0;background:#FFF9F2;font-family:'Nunito Sans',Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#3B2416;font-size:24px;margin:0;">🌳 Petit Baobab</h1>
        </div>
        <div style="background:#ffffff;border-radius:24px;padding:32px 28px;box-shadow:0 8px 24px rgba(59,36,22,.08);">
          <h2 style="color:#3B2416;font-size:20px;margin:0 0 12px;">Bienvenue ${displayName} !</h2>
          <p style="color:#5A4B3E;font-size:15px;line-height:1.6;margin:0 0 16px;">
            Ton compte Petit Baobab est prêt. Des coloriages, des histoires et des livres
            personnalisés t'attendent pour apprendre en t'amusant.
          </p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://monpetitbaobab.com"}/login"
             style="display:inline-block;background:#7D6AF8;color:#fff;font-weight:700;font-size:15px;
                    text-decoration:none;padding:12px 28px;border-radius:9999px;">
            Accéder à mon espace
          </a>
          <p style="color:#9A8C7E;font-size:13px;margin:24px 0 0;">
            Si tu n'as pas créé ce compte, tu peux ignorer cet e-mail.
          </p>
        </div>
        <p style="text-align:center;color:#B7A99B;font-size:12px;margin-top:20px;">
          Petit Baobab — L'univers créatif qui fait grandir les enfants.
        </p>
      </div>
    </body>
  </html>`;
}
