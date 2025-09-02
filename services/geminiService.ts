import { GoogleGenAI, Modality } from "@google/genai";
import type { Model, Vibe, ProductImage } from './types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Variabel lingkungan API_KEY tidak diatur");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateImage = async (
  productImage: ProductImage,
  model: Model,
  vibe: Vibe
): Promise<{ image: string; caption: string }> => {
  try {
    const prompt = `Dengan gambar produk ini, harap tambahkan model '${model.name}' yang realistis, yang merupakan ${model.description}. Model harus menampilkan produk secara alami. Pemandangan keseluruhan harus memiliki estetika '${vibe.name}', mengikuti arahan ini: "${vibe.prompt}". Gambar akhir harus berupa foto promosi berkualitas tinggi dalam rasio aspek potret 9:16, yang cocok untuk video TikTok. Buat juga caption TikTok yang singkat dan menarik untuk produk ini.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: productImage.base64,
                        mimeType: productImage.mimeType,
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let generatedImage = '';
    let generatedCaption = 'Lihat produk luar biasa ini!';

    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            generatedImage = part.inlineData.data;
        } else if (part.text) {
            generatedCaption = part.text.replace(/\*/g, ''); // Membersihkan markdown
        }
    }
    
    if (!generatedImage) {
        throw new Error('Pembuatan gambar gagal, tidak ada data gambar yang dikembalikan.');
    }

    return { image: generatedImage, caption: generatedCaption };
  } catch (error) {
    console.error("Kesalahan saat membuat gambar:", error);
    throw new Error("Gagal membuat gambar. Silakan coba lagi.");
  }
};

export const generateVideo = async (
  generatedImage: string,
  vibe: Vibe,
  updateLoadingMessage: (message: string) => void
): Promise<string> => {
  try {
    updateLoadingMessage("Memulai proses pembuatan video...");
    const prompt = `Buat iklan video 5 detik yang pendek dan dinamis untuk TikTok berdasarkan gambar ini. Video harus memiliki nuansa ${vibe.name} (${vibe.prompt}). Animasikan adegan dengan gerakan halus, seperti model yang sedikit bergeser, efek zoom lembut, atau kilatan cahaya. Fokus harus tetap pada produk.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: generatedImage,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        aspectRatio: '9:16',
      }
    });

    let checks = 0;
    while (!operation.done) {
        checks++;
        updateLoadingMessage(`Merender video... (pemeriksaan ${checks}) Ini bisa memakan waktu beberapa menit.`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // Poll setiap 10 detik
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    updateLoadingMessage("Menyelesaikan video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Pembuatan video selesai, tetapi tidak ada tautan unduhan yang diberikan.');
    }
    
    const response = await fetch(`${downloadLink}&key=${API_KEY}`);
    if (!response.ok) {
        throw new Error(`Gagal mengunduh file video: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    return videoUrl;

  } catch (error) {
    console.error("Kesalahan saat membuat video:", error);
    throw new Error("Gagal membuat video. Silakan coba lagi.");
  }
};