import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { useEffect, useRef } from "react";

export const metadata: Metadata = {
  title: "Editor Cahier de Souvenirs",
  description: "Nouveau éditeur du cahier de souvenirs basé sur le design fourni",
};

export default function EditorPage() {
  const htmlPath = path.join(process.cwd(), "docs", "cahier de souvernir", "index.html");
  const html = fs.readFileSync(htmlPath, "utf8");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Extract and execute script blocks from the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const scripts = Array.from(tempDiv.querySelectorAll('script'));
    scripts.forEach((script) => {
      const newScript = document.createElement('script');
      if (script.src) {
        newScript.src = script.src;
      } else {
        newScript.text = script.textContent || '';
      }
      document.body.appendChild(newScript);
    });
    // Insert the HTML (without script tags) into the container
    const htmlWithoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    if (containerRef.current) {
      containerRef.current.innerHTML = htmlWithoutScripts;
    }
    // Cleanup scripts on unmount
    return () => {
      scripts.forEach((script) => {
        const sel = script.src ? `script[src="${script.src}"]` : `script`; // generic removal
        const existing = document.querySelectorAll(sel);
        existing.forEach((el) => el.remove());
      });
    };
  }, []);

  return <div ref={containerRef} />;
}

