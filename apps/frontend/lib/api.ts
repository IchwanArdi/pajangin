import { createClient } from './supabase/client';
import { getAttribution, getDevice, getSessionId } from './attribution';

// url dasar backend nestjs (port 3001)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// tipe data bisnis
export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  category: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  whatsapp: string;
  opening_hours: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  service_area: string | null;
  rating: number | null;
  review_count: number | null;
  faq: string | null;
  province: string | null;
  price_range: string | null;
  meta_title: string | null;
  meta_description: string | null;
  google_maps_url: string | null;
  instagram_url: string | null;
  booking_enabled: boolean;
  testimonials: string | null;
  template: string;
  theme_color: string | null;
  created_at: string;
  updated_at: string;
}

// tipe data layanan/produk
export interface Service {
  id: string;
  business_id: string;
  name: string;
  price: number | null;
  price_prefix: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

// respon halaman publik (profil + layanan + schema.org json-ld)
export interface PublicBusinessResponse {
  business: Business;
  services: Service[];
  images?: BusinessImageItem[];
  schemaJsonLd: Record<string, unknown>;
  complete: boolean;
}

// data ringkasan analitik di dashboard
export interface DashboardOverview {
  overview: {
    visitors: number;
    pageViews: number;
    whatsappClicks: number;
    phoneClicks: number;
    contacts: number;
    leads: number;
    conversionRate: number;
  };
  // % perubahan vs periode sebelumnya (conversionRate = selisih poin %); null = sebelumnya kosong
  deltas: {
    visitors: number | null;
    pageViews: number | null;
    contacts: number | null;
    leads: number | null;
    conversionRate: number | null;
  };
  funnel: {
    visitors: number;
    viewedService: number;
    contacted: number;
  };
  trafficSources: Array<{
    source: string;
    key: string;
    count: number;
    percentage: number;
  }>;
  topServices: Array<{
    id: string;
    name: string;
    isFeatured: boolean;
    views: number;
    clicks: number;
    conversionRate: number;
  }>;
  periodDays: number;
}

export interface TimeseriesPoint {
  date: string; // YYYY-MM-DD (WIB)
  visitors: number;
  contacts: number;
  views: number;
}

export interface ActivityItem {
  id: string;
  type: 'page_view' | 'service_view' | 'whatsapp_click' | 'phone_click' | 'lead_submit';
  targetName: string | null;
  source: string;
  device: string;
  createdAt: string;
}

// saran otomatis dari insight engine
export interface MarketingInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'opportunity';
  title: string;
  metric?: string;
  description: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Low';
  targetId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  is_admin: boolean;
}

export interface AccountDeletionImpact {
  businesses: Array<{ id: string; name: string; slug: string }>;
  totals: {
    businesses: number;
    services: number;
    images: number;
    leads: number;
    bookings: number;
    feedback: number;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// ===== helper request =====

// ambil access token dari sesi Supabase (otomatis di-refresh oleh supabase-js)
async function getAccessToken(): Promise<string | null> {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token ?? null;
}

// sesi habis / tidak valid → keluar dan kembali ke login, lalu balik ke halaman ini setelah masuk
async function handleUnauthorized() {
  if (typeof window === 'undefined') return;
  await createClient().auth.signOut({ scope: 'local' });
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  // sengaja full reload (bukan router.push): helper ini di luar komponen & state lama harus dibuang
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `/login?next=${next}&reason=session_expired`;
}

// NestJS mengirim { statusCode, message: string | string[], error }
async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => null);
  const msg = body?.message;
  if (Array.isArray(msg)) return msg.join(' ');
  if (typeof msg === 'string' && msg) return msg;
  return fallback;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; fallbackError?: string } = {},
): Promise<T> {
  const { auth = false, fallbackError = 'Terjadi kesalahan. Coba lagi.', headers, ...rest } = init;
  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };

  if (rest.body && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAccessToken();
    if (!token) {
      await handleUnauthorized();
      throw new ApiError('Sesi Anda telah berakhir. Silakan masuk kembali.', 401);
    }
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store', ...rest, headers: finalHeaders });
  } catch {
    throw new ApiError('Tidak bisa terhubung ke server. Periksa koneksi internet Anda.', 0);
  }

  if (res.status === 401 && auth) {
    await handleUnauthorized();
    throw new ApiError('Sesi Anda telah berakhir. Silakan masuk kembali.', 401);
  }

  if (!res.ok) {
    throw new ApiError(await readErrorMessage(res, fallbackError), res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ===== akun =====

export async function getCurrentUser(): Promise<UserProfile> {
  const data = await request<{ user: UserProfile }>('/api/v1/auth/me', { auth: true });
  return data.user;
}

export async function updateCurrentUser(payload: {
  name: string;
  whatsapp: string | null;
}): Promise<UserProfile> {
  const data = await request<{ user: UserProfile }>('/api/v1/auth/me', {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal memperbarui informasi akun.',
  });
  return data.user;
}

export function getAccountDeletionImpact(): Promise<AccountDeletionImpact> {
  return request<AccountDeletionImpact>('/api/v1/auth/me/deletion-impact', {
    auth: true,
    fallbackError: 'Gagal memuat data yang akan dihapus.',
  });
}

export function deleteCurrentAccount(confirmation: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/api/v1/auth/me', {
    method: 'DELETE',
    auth: true,
    body: JSON.stringify({ confirmation }),
    fallbackError: 'Gagal menghapus akun. Coba lagi.',
  });
}

// ===== bisnis =====

// ambil bisnis milik user yg sedang login
export function getMyBusinesses(): Promise<Business[]> {
  return request<Business[]>('/api/v1/my/businesses', {
    auth: true,
    fallbackError: 'Gagal memuat daftar bisnis.',
  });
}

export interface NewBusinessPayload {
  name: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  tagline?: string;
  description?: string;
  opening_hours?: string;
  template?: string;
  theme_color?: string;
  services?: Array<{ name: string; price?: number; description?: string }>;
}

// buat bisnis baru beserta layanan pertamanya
export function createNewBusiness(payload: NewBusinessPayload): Promise<Business> {
  return request<Business>('/api/v1/my/businesses', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal membuat bisnis baru.',
  });
}

// update profil bisnis (butuh login sebagai pemilik)
export function updateBusiness(businessId: string, payload: Partial<Business>): Promise<Business> {
  return request<Business>(`/api/v1/businesses/${businessId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal memperbarui profil bisnis.',
  });
}

// ambil detail bisnis publik berdasarkan slug (dipakai server component halaman publik)
// fresh=true dipakai layar sukses agar checklist indeks tidak membaca cache lama setelah user menambah foto.
export async function getPublicBusiness(
  slug: string,
  options: { fresh?: boolean } = {},
): Promise<PublicBusinessResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/public/business/${encodeURIComponent(slug)}`,
      options.fresh ? { cache: 'no-store' } : { next: { revalidate: 30 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Error saat fetch public business:', err);
    return null;
  }
}

// ===== layanan =====

export function getServices(businessId: string): Promise<Service[]> {
  return request<Service[]>(`/api/v1/businesses/${businessId}/services`, {
    auth: true,
    fallbackError: 'Gagal memuat layanan.',
  });
}

export function addService(
  businessId: string,
  payload: { name: string; price?: number | null; description?: string; price_prefix?: string; category?: string; image_url?: string; is_featured?: boolean },
): Promise<Service> {
  return request<Service>(`/api/v1/businesses/${businessId}/services`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal menambah layanan.',
  });
}

export type ServiceUpdate = Partial<
  Pick<Service, 'name' | 'price' | 'price_prefix' | 'description' | 'category' | 'image_url' | 'is_featured' | 'order_index'>
>;

export function updateService(businessId: string, serviceId: string, payload: ServiceUpdate): Promise<Service> {
  return request<Service>(`/api/v1/businesses/${businessId}/services/${serviceId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal memperbarui layanan.',
  });
}

export async function deleteService(businessId: string, serviceId: string): Promise<void> {
  await request(`/api/v1/businesses/${businessId}/services/${serviceId}`, {
    method: 'DELETE',
    auth: true,
    fallbackError: 'Gagal menghapus layanan.',
  });
}

// ===== analitik =====

export function getDashboardOverview(businessId: string, days = 30): Promise<DashboardOverview> {
  return request<DashboardOverview>(`/api/v1/dashboard/${businessId}/overview?days=${days}`, {
    auth: true,
    fallbackError: 'Gagal mengambil analitik.',
  });
}

export function getMarketingInsights(businessId: string, days = 30): Promise<MarketingInsight[]> {
  return request<MarketingInsight[]>(`/api/v1/dashboard/${businessId}/insights?days=${days}`, {
    auth: true,
    fallbackError: 'Gagal mengambil rekomendasi.',
  });
}

export function getTimeseries(businessId: string, days = 30): Promise<{ periodDays: number; points: TimeseriesPoint[] }> {
  return request(`/api/v1/dashboard/${businessId}/timeseries?days=${days}`, {
    auth: true,
    fallbackError: 'Gagal mengambil data tren.',
  });
}

export function getActivity(businessId: string, limit = 12): Promise<ActivityItem[]> {
  return request<ActivityItem[]>(`/api/v1/dashboard/${businessId}/activity?limit=${limit}`, {
    auth: true,
    fallbackError: 'Gagal mengambil aktivitas.',
  });
}

// kirim tracking event dari browser (page view, klik WA, telepon)
export async function sendAnalyticsEvent(payload: {
  business_id: string;
  event_type: 'page_view' | 'service_view' | 'whatsapp_click' | 'phone_click' | 'lead_submit';
  target_id?: string;
  target_name?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device?: string;
  session_id?: string;
}) {
  try {
    // keepalive: request tetap terkirim walau pengunjung langsung pindah ke WhatsApp.
    // (bukan sendBeacon — beacon selalu mengirim credentials sehingga ditolak CORS backend)
    await fetch(`${API_BASE_URL}/api/v1/public/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'omit',
    });
  } catch (e) {
    console.warn('Gagal mencatat event analitik:', e);
  }
}

// ===== lead / pesan dari form kontak =====

export interface LeadItem {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  message: string | null;
  service_id: string | null;
  service_name: string | null;
  created_at: string;
}

export interface NewLeadPayload {
  business_id: string;
  name: string;
  phone: string;
  message?: string;
  service_id?: string;
  service_name?: string;
}

// Lead selalu membawa session + UTM yang sama dengan page_view.
export function createLead(payload: NewLeadPayload): Promise<{ success: boolean; lead_id: string }> {
  const attribution = getAttribution();
  return request<{ success: boolean; lead_id: string }>('/api/v1/public/leads', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      ...attribution,
      device: getDevice(),
      session_id: getSessionId(),
    }),
    fallbackError: 'Gagal mengirim pesan. Coba lagi.',
  });
}

export function getLeads(businessId: string, limit = 100): Promise<LeadItem[]> {
  return request<LeadItem[]>(`/api/v1/businesses/${businessId}/leads?limit=${limit}`, {
    auth: true,
    fallbackError: 'Gagal memuat pesan masuk.',
  });
}

// ===== galeri foto bisnis =====

export interface BusinessImageItem {
  id: string;
  business_id: string;
  url: string;
  caption: string | null;
  category: string | null;
  order_index: number;
  created_at: string;
}

export function getImages(businessId: string): Promise<BusinessImageItem[]> {
  return request<BusinessImageItem[]>(`/api/v1/businesses/${businessId}/images`, {
    auth: true,
    fallbackError: 'Gagal memuat galeri foto.',
  });
}

export function addImage(
  businessId: string,
  payload: { url: string; caption?: string; category?: string },
): Promise<BusinessImageItem> {
  return request<BusinessImageItem>(`/api/v1/businesses/${businessId}/images`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal menambahkan foto ke galeri.',
  });
}

export function updateImage(
  businessId: string,
  imageId: string,
  payload: { caption?: string | null; category?: string | null; order_index?: number },
): Promise<BusinessImageItem> {
  return request<BusinessImageItem>(`/api/v1/businesses/${businessId}/images/${imageId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal memperbarui foto.',
  });
}

export async function deleteImage(businessId: string, imageId: string): Promise<void> {
  await request(`/api/v1/businesses/${businessId}/images/${imageId}`, {
    method: 'DELETE',
    auth: true,
    fallbackError: 'Gagal menghapus foto.',
  });
}

// ===== booking & reservasi =====

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingItem {
  id: string;
  business_id: string;
  service_id: string | null;
  service_name: string | null;
  name: string;
  phone: string;
  email: string | null;
  date: string;
  time_slot: string;
  pax: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
}

export interface CreateBookingPayload {
  business_id: string;
  service_id?: string;
  service_name?: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time_slot: string;
  pax?: number;
  notes?: string;
}

export function getBookings(businessId: string, status?: string, date?: string): Promise<BookingItem[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (date) params.append('date', date);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return request<BookingItem[]>(`/api/v1/businesses/${businessId}/bookings${qs}`, {
    auth: true,
    fallbackError: 'Gagal memuat daftar reservasi/booking.',
  });
}

export function getBookingStats(businessId: string): Promise<BookingStats> {
  return request<BookingStats>(`/api/v1/businesses/${businessId}/bookings/stats`, {
    auth: true,
    fallbackError: 'Gagal memuat statistik reservasi.',
  });
}

export function createPublicBooking(payload: CreateBookingPayload): Promise<BookingItem> {
  return request<BookingItem>('/api/v1/public/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
    fallbackError: 'Gagal mengajukan reservasi/booking.',
  });
}

export function updateBooking(
  businessId: string,
  bookingId: string,
  payload: { status?: BookingStatus; notes?: string; time_slot?: string; date?: string },
): Promise<BookingItem> {
  return request<BookingItem>(`/api/v1/businesses/${businessId}/bookings/${bookingId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal memperbarui status reservasi.',
  });
}

export async function deleteBooking(businessId: string, bookingId: string): Promise<void> {
  await request(`/api/v1/businesses/${businessId}/bookings/${bookingId}`, {
    method: 'DELETE',
    auth: true,
    fallbackError: 'Gagal menghapus reservasi.',
  });
}

// ===== notifikasi real-time =====

export interface NotificationItem {
  id: string;
  type: 'booking' | 'lead';
  title: string;
  description: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  is_new: boolean;
  status?: string;
}

export interface NotificationsResponse {
  items: NotificationItem[];
  unread_count: number;
}

export function getNotifications(businessId: string): Promise<NotificationsResponse> {
  return request<NotificationsResponse>(`/api/v1/businesses/${businessId}/notifications`, {
    auth: true,
    fallbackError: 'Gagal memuat notifikasi real-time.',
  });
}

export function testNotification(businessId: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>(`/api/v1/businesses/${businessId}/notifications/test`, {
    method: 'POST',
    auth: true,
    fallbackError: 'Gagal mengirim pesan uji coba WhatsApp.',
  });
}

// ===== AI content generator =====

export type AiContentType =
  | 'deskripsi_bisnis'
  | 'tagline'
  | 'deskripsi_layanan'
  | 'post_sosmed'
  | 'seo_meta'
  | 'faq'
  | 'ucapan_whatsapp'
  | 'testimonial_request';

export interface AiGeneratePayload {
  content_type: AiContentType;
  context?: string;
  service_id?: string;
  tone?: 'formal' | 'santai' | 'profesional';
  provider?: 'openai' | 'gemini';
}

export interface AiGenerateResponse {
  content: string;
  provider: string;
  content_type: AiContentType;
}

export interface AiProvidersResponse {
  openai: boolean;
  gemini: boolean;
}

export function getAiProviders(businessId: string): Promise<AiProvidersResponse> {
  return request<AiProvidersResponse>(`/api/v1/businesses/${businessId}/ai/providers`, {
    auth: true,
    fallbackError: 'Gagal memeriksa status AI provider.',
  });
}

export function generateAiContent(
  businessId: string,
  payload: AiGeneratePayload,
): Promise<AiGenerateResponse> {
  return request<AiGenerateResponse>(`/api/v1/businesses/${businessId}/ai/generate`, {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal menghasilkan konten dengan AI.',
  });
}

// ===== masukan pengguna + admin console =====

export type FeedbackCategory = 'masukan' | 'kritik' | 'bug' | 'lainnya';
export type FeedbackStatus = 'baru' | 'dibaca' | 'selesai';

export interface FeedbackItem {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  user_whatsapp: string | null;
  business_id: string | null;
  business_name: string | null;
  source: string;
  category: FeedbackCategory;
  rating: number | null;
  message: string;
  status: FeedbackStatus;
  created_at: string;
  updated_at: string;
}

export interface SubmitFeedbackPayload {
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
  business_id?: string | null;
}

export function submitFeedback(
  payload: SubmitFeedbackPayload,
): Promise<{ success: boolean; feedback_id: string; created_at: string }> {
  return request('/api/v1/feedback', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
    fallbackError: 'Gagal mengirim masukan.',
  });
}

export interface AdminFeedbackListResponse {
  items: FeedbackItem[];
  total: number;
  page: number;
  limit: number;
  counts: {
    semua: number;
    baru: number;
    dibaca: number;
    selesai: number;
  };
  average_rating: number | null;
}

export function getAdminFeedback(
  params: {
    status?: FeedbackStatus;
    category?: FeedbackCategory;
    page?: number;
    limit?: number;
  } = {},
): Promise<AdminFeedbackListResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.category) query.set('category', params.category);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 50));

  return request<AdminFeedbackListResponse>(`/api/v1/admin/feedback?${query.toString()}`, {
    auth: true,
    fallbackError: 'Gagal memuat masukan.',
  });
}

export function updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<FeedbackItem> {
  return request<FeedbackItem>(`/api/v1/admin/feedback/${id}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ status }),
    fallbackError: 'Gagal memperbarui status masukan.',
  });
}

export interface AdminSeriesPoint {
  date: string;
  users: number;
  businesses: number;
}

export interface AdminOverview {
  period_days: number;
  users: {
    total: number;
    new: number;
    previous: number;
    delta: number | null;
    with_business: number;
  };
  businesses: {
    total: number;
    new: number;
    previous: number;
    delta: number | null;
    with_services: number;
    with_hero: number;
    booking_enabled: number;
    with_traffic: number;
  };
  feedback: {
    total: number;
    new: number;
    unread: number;
    average_rating: number | null;
    by_category: Array<{ category: FeedbackCategory; count: number }>;
  };
  activity: {
    page_views: number;
    page_views_delta: number | null;
    whatsapp_clicks: number;
    whatsapp_clicks_delta: number | null;
    leads: number;
    leads_delta: number | null;
    bookings: number;
    bookings_delta: number | null;
  };
  series: AdminSeriesPoint[];
  top_cities: Array<{ city: string; count: number }>;
  top_categories: Array<{ category: string; count: number }>;
  recent_users: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    business_count: number;
  }>;
  recent_businesses: Array<{
    id: string;
    slug: string;
    name: string;
    city: string;
    category: string;
    created_at: string;
    owner_name: string;
    owner_email: string;
  }>;
  recent_feedback: FeedbackItem[];
}

export function getAdminOverview(days = 30): Promise<AdminOverview> {
  return request<AdminOverview>(`/api/v1/admin/overview?days=${days}`, {
    auth: true,
    fallbackError: 'Gagal memuat ringkasan admin.',
  });
}

// ===== admin: daftar pengguna =====

export type AdminUserSort = 'newest' | 'oldest' | 'name';
export type AdminUserBusinessFilter = 'ya' | 'tidak';

export interface AdminUserBusiness {
  id: string;
  name: string;
  slug: string;
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  created_at: string;
  business_count: number;
  businesses: AdminUserBusiness[];
  feedback_count: number;
  last_feedback_at: string | null;
  is_admin: boolean;
}

export interface AdminUsersResponse {
  items: AdminUserListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary: {
    total: number;
    with_business: number;
    new_30d: number;
  };
}

export interface AdminUsersParams {
  q?: string;
  has_business?: AdminUserBusinessFilter;
  sort?: AdminUserSort;
  page?: number;
  limit?: number;
}

export function getAdminUsers(params: AdminUsersParams = {}): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.has_business) query.set('has_business', params.has_business);
  if (params.sort) query.set('sort', params.sort);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 20));

  return request<AdminUsersResponse>(`/api/v1/admin/users?${query.toString()}`, {
    auth: true,
    fallbackError: 'Gagal memuat daftar pengguna.',
  });
}

// ===== admin: daftar bisnis =====

export type AdminBusinessSort = 'newest' | 'oldest' | 'name';
export type AdminBusinessCompleteness = 'lengkap' | 'perlu';

export interface AdminBusinessListItem {
  id: string;
  slug: string;
  name: string;
  city: string;
  category: string;
  created_at: string;
  updated_at: string;
  owner: {
    name: string;
    email: string;
    whatsapp: string | null;
  };
  service_count: number;
  image_count: number;
  lead_count: number;
  booking_count: number;
  has_description: boolean;
  has_hero: boolean;
  booking_enabled: boolean;
  completeness: AdminBusinessCompleteness;
  page_views_30d: number;
  whatsapp_clicks_30d: number;
  last_activity_at: string | null;
}

export interface AdminBusinessesResponse {
  items: AdminBusinessListItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary: {
    total: number;
    complete: number;
    incomplete: number;
    cities: number;
  };
  filter_options: {
    cities: string[];
    categories: string[];
  };
}

export interface AdminBusinessesParams {
  q?: string;
  city?: string;
  category?: string;
  completeness?: AdminBusinessCompleteness;
  sort?: AdminBusinessSort;
  page?: number;
  limit?: number;
}

export function getAdminBusinesses(
  params: AdminBusinessesParams = {},
): Promise<AdminBusinessesResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.city) query.set('city', params.city);
  if (params.category) query.set('category', params.category);
  if (params.completeness) query.set('completeness', params.completeness);
  if (params.sort) query.set('sort', params.sort);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 20));

  return request<AdminBusinessesResponse>(`/api/v1/admin/businesses?${query.toString()}`, {
    auth: true,
    fallbackError: 'Gagal memuat daftar bisnis.',
  });
}



