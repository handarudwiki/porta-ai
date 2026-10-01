import { NewsArticle } from "@/types/event";

const SECTORS_API_BASE_URL = "https://api.sectors.app/v1";

/**
 * Curated Indonesian financial news items reflecting all 9 event types specified in prompt.txt
 */
export const SAMPLE_IDX_NEWS_DATASET: NewsArticle[] = [
  {
    id: "news-idx-001",
    title: "Bank Indonesia Mempertahankan BI-Rate di 5,25% dan Memberikan Sinyal Easing Kuartal Depan",
    content: "Rapat Dewan Gubernur Bank Indonesia (RDG BI) memutuskan untuk mempertahankan BI-Rate di level 5,25%, suku bunga Deposit Facility sebesar 4,50%, dan suku bunga Lending Facility sebesar 6,00%. Gubernur BI menyampaikan bahwa stabilitas nilai tukar Rupiah terpelihara dan inflasi tetap terkendali dalam sasaran 2,5±1%. BI memberi sinyal adanya potensi penurunan suku bunga (dovish guidance) pada kuartal berikutnya apabila stabilitas eksternal mendukung.",
    published_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    source: "Sectors News Feed",
    url: "https://sectors.app/news/bi-rate-decision-525",
    category_hint: "MONETARY_POLICY"
  },
  {
    id: "news-idx-002",
    title: "Pemerintah Menaikkan Tarif Pajak Ekspor Komoditas Nikel Menjadi 10%",
    content: "Kementerian Keuangan merilis Peraturan Menteri Keuangan baru yang menaikkan bea keluar ekspor produk olahan nikel dari 5% menjadi 10% berlaku efektif bulan depan. Kebijakan ini diambil dalam rangka mendorong hilirisasi dalam negeri serta meningkatkan penerimaan negara dari sektor pertambangan mineral.",
    published_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    source: "Sectors News Feed",
    url: "https://sectors.app/news/esdm-export-tax-nickel-10",
    category_hint: "FISCAL_POLICY"
  },
  {
    id: "news-idx-003",
    title: "BBCA Membukukan Laba Bersih Rp 18 Triliun pada Q3 2026, Naik 15% YoY di Atas Ekspektasi Konsensus",
    content: "PT Bank Central Asia Tbk (BBCA) melaporkan kinerja keuangan Q3 2026 yang kuat dengan laba bersih konsolidasi mencapai Rp 18,0 triliun, tumbuh 15,0% secara tahunan (YoY). Pencapaian laba ini 5.9% melampaui estimasi konsensus analis (Rp 17,0 triliun). Pertumbuhan didorong oleh penyaluran kredit yang tumbuh 14.5% YoY serta penurunan BOPO menjadi 42.1%.",
    published_at: new Date(Date.now() - 1000 * 60 * 320).toISOString(), // 5 hours ago
    source: "Sectors Financial Reports",
    url: "https://sectors.app/news/bbca-q3-2026-earnings-beat",
    category_hint: "CORPORATE"
  },
  {
    id: "news-idx-004",
    title: "OJK Terbitkan Aturan Baru Batas Kepemilikan Saham dan Permodalan Minimum Sektor Perbankan",
    content: "Otoritas Jasa Keuangan (OJK) resmi mengundangkan Peraturan OJK (POJK) terbaru mengenai rasio kecukupan modal minimum dan batas maksimum pemberian kredit (BMPK) untuk bank umum. Aturan baru memperketat pengawasan permodalan tier-1 dan membatasi eksposur kepemilikan silang ekosistem digital.",
    published_at: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    source: "Sectors Regulatory Wire",
    url: "https://sectors.app/news/ojk-bank-capital-requirement",
    category_hint: "REGULATION"
  },
  {
    id: "news-idx-005",
    title: "Inflasi Indonesia Bulan Agustus Capai 3,2% YoY, Di Atas Ekspektasi Konsensus 2,9%",
    content: "Badan Pusat Statistik (BPS) mencatat inflasi Indeks Harga Konsumen (IHK) Indonesia bulan Agustus 2026 sebesar 3,2% YoY. Angka ini berada di atas ekspektasi pasar sebesar 2,9% YoY dan naik dari 2,8% pada bulan sebelumnya. Kejutan positif inflasi (+0,3%) dipicu oleh kenaikan harga bahan pangan dan komponen energi.",
    published_at: new Date(Date.now() - 1000 * 60 * 900).toISOString(), // 15 hours ago
    source: "Sectors Macro Statistics",
    url: "https://sectors.app/news/bps-cpi-inflation-august-2026",
    category_hint: "MACROECONOMIC"
  },
  {
    id: "news-idx-006",
    title: "Harga Nikel Dunia Drop 5% di LME Akibat Lonjakan Pasokan dan Penumpukan Stok",
    content: "Harga kontrak nikel di London Metal Exchange (LME) merosot 5,0% menjadi USD 15.000 per ton dari USD 15.790 per ton. Penurunan dipicu peningkatan pasokan dari smelter baru serta data persediaan gudang yang naik signifikan.",
    published_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString(), // 20 hours ago
    source: "Sectors Commodities Wire",
    url: "https://sectors.app/news/lme-nickel-price-drop-5",
    category_hint: "COMMODITY"
  },
  {
    id: "news-idx-007",
    title: "BBCA Umumkan Pembagian Dividen Interim Rp 250 per Lembar Saham",
    content: "Direksi PT Bank Central Asia Tbk (BBCA) mengumumkan pembagian dividen interim tunai untuk tahun buku 2026 sebesar Rp 250 per saham. Ex-date dividen dijadwalkan pada 28 September 2026 dengan pembayaran pada 12 Oktober 2026.",
    published_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString(), // 1 day ago
    source: "Sectors Corporate Actions",
    url: "https://sectors.app/news/bbca-interim-dividend-rp250",
    category_hint: "CORPORATE_ACTION"
  },
  {
    id: "news-idx-008",
    title: "Eskalasi Konflik Timur Tengah Mengancam Jalur Pasokan Minyak Mentah Global",
    content: "Ketegangan geopolitik meningkat di kawasan Selat Hormuz setelah terjadi serangan terhadap fasilitas infrastruktur energi. Harga minyak Brent melonjak 4.2% akibat kekhawatiran gangguan pasokan dan biaya logistik penerbangan/pelayaran naik tajam.",
    published_at: new Date(Date.now() - 1000 * 60 * 1800).toISOString(), // 30 hours ago
    source: "Sectors Global Wire",
    url: "https://sectors.app/news/middle-east-geopolitical-energy",
    category_hint: "GEOPOLITICAL"
  },
  {
    id: "news-idx-009",
    title: "IHSG Anjlok 3,2% Didorong Lonjakan Volume Penjualan Investor Asing",
    content: "Indeks Harga Saham Gabungan (IHSG) mengalami tekanan hebat dengan koreksi 3.2% ditutup pada level 7.120. Volume transaksi membengkak 2.08x lipat dari rata-rata harian (Rp 25 Triliun vs Rp 12 Triliun), menandakan rotasi sektor dan aksi profit taking massal.",
    published_at: new Date(Date.now() - 1000 * 60 * 2200).toISOString(), // 36 hours ago
    source: "Sectors Market Monitor",
    url: "https://sectors.app/news/ihsg-market-move-volume-spike",
    category_hint: "MARKET"
  }
];

/**
 * Fetches recent news from Sectors API or returns enriched fallback dataset.
 */
export async function fetchSectorsNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.SECTORS_API_KEY;

  if (!apiKey) {
    // Return sample dataset directly if API key is not present
    return SAMPLE_IDX_NEWS_DATASET;
  }

  try {
    const res = await fetch(`${SECTORS_API_BASE_URL}/news/recent/`, {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.warn(`[Sectors API] HTTP ${res.status}, falling back to sample dataset.`);
      return SAMPLE_IDX_NEWS_DATASET;
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any, idx: number) => ({
        id: item.id || `news-live-${idx}`,
        title: item.title || item.headline,
        content: item.summary || item.content || item.body,
        published_at: item.published_at || new Date().toISOString(),
        source: "Sectors Live API",
        url: item.url || `https://sectors.app/news/${item.id || idx}`
      }));
    }

    return SAMPLE_IDX_NEWS_DATASET;
  } catch (error) {
    console.error("[Sectors API Error]", error);
    return SAMPLE_IDX_NEWS_DATASET;
  }
}
