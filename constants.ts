
import type { Model, Vibe } from './types';

export const MODELS: Model[] = [
  {
    id: 'model1',
    name: 'Chloe',
    description: 'Influencer yang ramah dan mudah didekati dengan penampilan alami.',
    imageUrl: 'https://picsum.photos/seed/model1/400/600',
  },
  {
    id: 'model2',
    name: 'Alex',
    description: 'Model yang trendi dan edgy dengan gaya urban yang keren.',
    imageUrl: 'https://picsum.photos/seed/model2/400/600',
  },
  {
    id: 'model3',
    name: 'Sophia',
    description: 'Model yang elegan dan canggih, cocok untuk merek mewah.',
    imageUrl: 'https://picsum.photos/seed/model3/400/600',
  },
  {
    id: 'model4',
    name: 'Leo',
    description: 'Model yang sporty dan energik, bagus untuk kebugaran atau pakaian aktif.',
    imageUrl: 'https://picsum.photos/seed/model4/400/600',
  },
];

export const VIBES: Vibe[] = [
  {
    id: 'vibe1',
    name: 'Minimalis',
    description: 'Bersih, sederhana, dan elegan.',
    prompt: 'Buat adegan dengan estetika minimalis, menggunakan warna-warna netral, garis-garis bersih, dan banyak ruang negatif. Suasananya harus tenang dan canggih.',
  },
  {
    id: 'vibe2',
    name: 'Vintage',
    description: 'Nostalgia, hangat, dan retro.',
    prompt: 'Hasilkan adegan dengan nuansa vintage. Gunakan warna-warna hangat yang pudar, bintik film, dan gaya retro untuk lingkungan dan pakaian model. Pikirkan nostalgia tahun 70-an atau 80-an.',
  },
  {
    id: 'vibe3',
    name: 'Futuristik',
    description: 'Ramping, modern, dan berteknologi tinggi.',
    prompt: 'Ciptakan adegan futuristik. Gabungkan lampu neon, elemen holografik, dan arsitektur modern yang ramping. Suasananya harus berteknologi tinggi dan mutakhir.',
  },
  {
    id: 'vibe4',
    name: 'Bohemian',
    description: 'Berjiwa bebas, alami, dan bersahaja.',
    prompt: 'Rancang adegan bertema bohemian. Gunakan warna-warna tanah, tekstur alami seperti kayu dan makrame, dan banyak tanaman. Model harus memiliki penampilan yang santai dan berjiwa bebas.',
  },
];

export const VIDEO_LOADING_MESSAGES: string[] = [
    "Memanaskan mesin video...",
    "Mengatur koreografi model virtual Anda...",
    "Menerapkan suasana konten...",
    "Merender frame akhir...",
    "Menambahkan sedikit keajaiban TikTok...",
    "Hampir selesai, tinggal memoles piksel..."
];
