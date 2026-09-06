import { supabase } from "@/lib/supabaseClient";

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Service pour la gestion et l'optimisation des photos téléversées dans le cahier de souvenirs.
 * Intègre la compression côté client pour protéger les performances et la bande passante.
 */
export const memoryStorageService = {
  /**
   * Compresse un fichier image (PNG, JPG, WebP) côté client avant téléversement.
   */
  async compressImage(file: File, options: CompressOptions = {}): Promise<Blob> {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Impossible de créer le contexte canvas 2D"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Échec de la compression d'image"));
              }
            },
            "image/jpeg",
            quality
          );
        };
        img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Convertit un Blob en Data URL (fallback pratique et aperçu instantané sans latence)
   */
  blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Téléverse une photo dans Supabase Storage (bucket 'memory-books' ou fallback 'books')
   */
  async uploadPhoto(
    file: File | Blob,
    profileId: string,
    bookId: string,
    elementId: string
  ): Promise<{ url: string; path: string }> {
    // 1. Si c'est un fichier File, on le compresse d'abord
    const blobToUpload = file instanceof File ? await this.compressImage(file) : file;
    const fileName = `${profileId}/${bookId}/${elementId}_${Date.now()}.jpg`;

    // 2. Tentative d'upload sur Supabase Storage
    try {
      // Tenter d'abord le bucket memory-books
      let bucketName = "memory-books";
      let { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blobToUpload, {
          contentType: "image/jpeg",
          upsert: true,
        });

      // Si le bucket n'existe pas encore côté Supabase, fallback transparent sur 'books'
      if (error && error.message?.includes("bucket")) {
        bucketName = "books";
        const fallbackRes = await supabase.storage
          .from(bucketName)
          .upload(fileName, blobToUpload, {
            contentType: "image/jpeg",
            upsert: true,
          });
        data = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        return {
          url: publicData.publicUrl,
          path: fileName,
        };
      }
    } catch (err) {
      console.warn("Storage Supabase non accessible ou hors ligne, fallback local:", err);
    }

    // 3. Fallback robuste : DataURL local (aucun blocage utilisateur)
    const localDataUrl = await this.blobToDataUrl(blobToUpload);
    return {
      url: localDataUrl,
      path: `local_${elementId}`,
    };
  },
};
