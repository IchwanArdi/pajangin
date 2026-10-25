import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { isUuid } from '../common/uuid.js';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// ===== Tipe generate content =====

export type ContentType =
  | 'deskripsi_bisnis'
  | 'tagline'
  | 'deskripsi_layanan'
  | 'post_sosmed'
  | 'seo_meta'
  | 'faq'
  | 'ucapan_whatsapp'
  | 'testimonial_request';

export interface GenerateInput {
  content_type: ContentType;
  context?: string; // konteks tambahan dari user (opsional)
  service_id?: string; // untuk deskripsi_layanan — layanan mana yang dibantu
  tone?: string; // 'formal' | 'santai' | 'profesional' (default: 'profesional')
  provider?: 'openai' | 'gemini'; // default: auto (coba openai dulu, fallback gemini)
}

export interface GenerateResponse {
  content: string;
  provider: string;
  content_type: ContentType;
}

// ===== Prompt builder per content type =====

function buildSystemPrompt(): string {
  return `Kamu adalah asisten konten marketing profesional untuk bisnis kecil dan UMKM Indonesia.
Tugas: membuat konten pemasaran berkualitas tinggi dalam Bahasa Indonesia yang natural.
Aturan:
- Gunakan Bahasa Indonesia yang baik, natural, dan menarik.
- Jangan gunakan kata-kata berlebihan atau clickbait murahan.
- Sesuaikan gaya bahasa dengan tipe bisnis.
- Langsung hasilkan konten yang diminta, tanpa penjelasan tambahan atau preamble.
- Jangan gunakan formatting markdown (# ## * ** dll) kecuali diminta.`;
}

function buildUserPrompt(
  type: ContentType,
  businessName: string,
  category: string,
  city: string,
  description: string | null,
  services: Array<{
    name: string;
    description: string | null;
    price: number | null;
  }>,
  context: string | null,
  tone: string,
  targetService?: {
    name: string;
    description: string | null;
    price: number | null;
  },
): string {
  const info = [
    `Nama bisnis: ${businessName}`,
    `Kategori: ${category}`,
    `Kota: ${city}`,
    description ? `Deskripsi saat ini: ${description}` : null,
    services.length > 0
      ? `Layanan/Produk:\n${services.map((s) => `- ${s.name}${s.price ? ` (Rp ${s.price.toLocaleString('id-ID')})` : ''}${s.description ? `: ${s.description}` : ''}`).join('\n')}`
      : null,
    context ? `Catatan tambahan dari pemilik: ${context}` : null,
    `Gaya bahasa: ${tone}`,
  ]
    .filter(Boolean)
    .join('\n');

  const prompts: Record<ContentType, string> = {
    deskripsi_bisnis: `Buatkan deskripsi bisnis yang menarik dan informatif untuk halaman profil bisnis online (2-3 paragraf pendek). Deskripsi harus menjelaskan apa yang ditawarkan, keunggulan, dan mengapa pelanggan harus memilih bisnis ini.\n\n${info}`,

    tagline: `Buatkan 5 pilihan tagline/slogan pendek dan catchy untuk bisnis ini. Masing-masing 1 baris, dipisahkan dengan baris baru. Tagline harus mudah diingat dan mencerminkan nilai bisnis.\n\n${info}`,

    deskripsi_layanan: targetService
      ? `Buatkan deskripsi layanan/produk yang menarik untuk "${targetService.name}" (1-2 paragraf pendek). ${targetService.price ? `Harga: Rp ${targetService.price.toLocaleString('id-ID')}` : ''}. ${targetService.description ? `Deskripsi saat ini: ${targetService.description}` : 'Belum ada deskripsi.'}\n\nKonteks bisnis:\n${info}`
      : `Buatkan deskripsi singkat yang menarik untuk masing-masing layanan/produk berikut. Format: nama layanan di baris pertama, lalu deskripsi 1-2 kalimat.\n\n${info}`,

    post_sosmed: `Buatkan 3 ide posting media sosial (Instagram/Facebook) untuk bisnis ini. Setiap posting berisi: caption yang engaging (2-3 kalimat), 3-5 hashtag relevan. Pisahkan setiap posting dengan "---".\n\n${info}`,

    seo_meta: `Buatkan judul (maks 60 karakter) dan deskripsi (maks 155 karakter) untuk hasil pencarian Google halaman bisnis ini. Format:\nJudul di Google: [judul]\nDeskripsi di Google: [deskripsi]\n\n${info}`,

    faq: `Buatkan 5 pertanyaan FAQ (Frequently Asked Questions) yang relevan beserta jawabannya untuk bisnis ini. Format: setiap FAQ diawali "Q:" untuk pertanyaan dan "A:" untuk jawaban.\n\n${info}`,

    ucapan_whatsapp: `Buatkan 3 template pesan WhatsApp untuk bisnis ini:\n1. Pesan sambutan otomatis untuk pelanggan baru\n2. Pesan follow-up setelah pembelian/layanan\n3. Pesan promo/penawaran spesial\n\nSetiap template harus pendek, ramah, dan profesional. Pisahkan dengan "---".\n\n${info}`,

    testimonial_request: `Buatkan template pesan WhatsApp yang sopan untuk meminta testimoni/review dari pelanggan yang sudah menggunakan jasa/produk bisnis ini. Buat 2 variasi: formal dan santai. Pisahkan dengan "---".\n\n${info}`,
  };

  return prompts[type];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly usage = new Map<string, { day: string; count: number }>();
  private openai: OpenAI | null = null;
  private gemini: GoogleGenAI | null = null;

  constructor(private readonly prisma: PrismaService) {
    // Inisialisasi OpenAI jika ada API key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
      this.logger.log('OpenAI provider tersedia');
    }

    // Inisialisasi Gemini jika ada API key
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      this.gemini = new GoogleGenAI({ apiKey: geminiKey });
      this.logger.log('Gemini provider tersedia');
    }

    if (!this.openai && !this.gemini) {
      this.logger.warn(
        'Tidak ada AI provider yang tersedia — set OPENAI_API_KEY atau GEMINI_API_KEY',
      );
    }
  }

  // Kuota wajar untuk free tier. In-memory cukup untuk satu instance;
  // kalau deploy lebih dari satu instance, pindahkan ke Redis/DB.
  private takeDailyQuota(userId: string) {
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());
    const limit = Math.max(1, Number(process.env.AI_DAILY_LIMIT) || 20);
    const current = this.usage.get(userId);

    if (!current || current.day !== day) {
      this.usage.set(userId, { day, count: 1 });
      return;
    }
    if (current.count >= limit) {
      throw new HttpException(
        `Kuota AI gratis ${limit} generate per hari sudah habis. Coba lagi besok atau gunakan contoh konten manual.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    current.count += 1;
  }

  // ===== Ownership check =====
  private async checkOwnership(businessId: string, userId: string) {
    if (!isUuid(businessId))
      throw new NotFoundException('Bisnis tidak ditemukan');
    const biz = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { userId: true },
    });
    if (!biz) throw new NotFoundException('Bisnis tidak ditemukan');
    if (biz.userId !== userId) throw new ForbiddenException('Akses ditolak');
  }

  // ===== Generate dengan OpenAI =====
  private async generateWithOpenAI(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    if (!this.openai) throw new Error('OpenAI tidak tersedia');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) throw new Error('OpenAI tidak menghasilkan respons');
    return text;
  }

  // ===== Generate dengan Gemini =====
  private async generateWithGemini(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    if (!this.gemini) throw new Error('Gemini tidak tersedia');

    const response = await this.gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
    });

    const text = response.text?.trim();
    if (!text) throw new Error('Gemini tidak menghasilkan respons');
    return text;
  }

  // ===== Main generate method =====
  async generate(
    businessId: string,
    userId: string,
    input: GenerateInput,
  ): Promise<GenerateResponse> {
    await this.checkOwnership(businessId, userId);
    this.takeDailyQuota(userId);

    // Validasi content_type
    const validTypes: ContentType[] = [
      'deskripsi_bisnis',
      'tagline',
      'deskripsi_layanan',
      'post_sosmed',
      'seo_meta',
      'faq',
      'ucapan_whatsapp',
      'testimonial_request',
    ];
    if (!validTypes.includes(input.content_type)) {
      throw new BadRequestException(
        `Tipe konten "${input.content_type}" tidak valid`,
      );
    }

    // Ambil data bisnis + layanan untuk konteks
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        services: { orderBy: { orderIndex: 'asc' }, take: 10 },
      },
    });
    if (!business) throw new NotFoundException('Bisnis tidak ditemukan');

    // Jika generate deskripsi layanan spesifik
    let targetService:
      | { name: string; description: string | null; price: number | null }
      | undefined;
    if (input.content_type === 'deskripsi_layanan' && input.service_id) {
      if (!isUuid(input.service_id))
        throw new BadRequestException('ID layanan tidak valid');
      const svc = await this.prisma.service.findFirst({
        where: { id: input.service_id, businessId },
      });
      if (svc) {
        targetService = {
          name: svc.name,
          description: svc.description,
          price: svc.price,
        };
      }
    }

    const tone = input.tone || 'profesional';
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(
      input.content_type,
      business.name,
      business.category,
      business.city,
      business.description,
      business.services.map((s) => ({
        name: s.name,
        description: s.description,
        price: s.price,
      })),
      input.context || null,
      tone,
      targetService,
    );

    // Strategi: coba provider yang diminta, atau auto (Gemini dulu karena free tier lebih besar, fallback ke OpenAI)
    const preferredProvider = input.provider || 'auto';

    if (preferredProvider === 'openai') {
      return this.tryGenerate(
        'openai',
        systemPrompt,
        userPrompt,
        input.content_type,
      );
    }

    if (preferredProvider === 'gemini') {
      return this.tryGenerate(
        'gemini',
        systemPrompt,
        userPrompt,
        input.content_type,
      );
    }

    // Auto: Gemini → OpenAI (Gemini punya free tier lebih besar)
    try {
      return await this.tryGenerate(
        'gemini',
        systemPrompt,
        userPrompt,
        input.content_type,
      );
    } catch (geminiErr) {
      this.logger.warn(
        `Gemini gagal, fallback ke OpenAI: ${(geminiErr as Error).message}`,
      );
      try {
        return await this.tryGenerate(
          'openai',
          systemPrompt,
          userPrompt,
          input.content_type,
        );
      } catch (openaiErr) {
        this.logger.error(
          `Semua AI provider gagal. OpenAI: ${(openaiErr as Error).message}`,
        );
        throw new BadRequestException(
          'Semua AI provider sedang tidak tersedia. Coba lagi dalam beberapa saat.',
        );
      }
    }
  }

  private async tryGenerate(
    provider: 'openai' | 'gemini',
    systemPrompt: string,
    userPrompt: string,
    contentType: ContentType,
  ): Promise<GenerateResponse> {
    let content: string;

    if (provider === 'openai') {
      content = await this.generateWithOpenAI(systemPrompt, userPrompt);
    } else {
      content = await this.generateWithGemini(systemPrompt, userPrompt);
    }

    return { content, provider, content_type: contentType };
  }

  // ===== Cek provider yang tersedia =====
  getAvailableProviders(): { openai: boolean; gemini: boolean } {
    return {
      openai: this.openai !== null,
      gemini: this.gemini !== null,
    };
  }
}
