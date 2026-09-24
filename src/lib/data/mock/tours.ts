import type { Tour } from "@/lib/types";

export const mockTours: Tour[] = [
  {
    isPopular: false,
    id: "tur-avustralya-tasmanya",
    slug: "avustralya-tasmanya-turu",
    name: "Avustralya & Tasmanya Turu",
    region: "Avustralya",
    summary:
      "Sydney, Melbourne ve Hobart'ta 9 gece 10 gün sürecek Avustralya'nın büyüsüne kapılmaya hazır olun!",
    description:
      "Sydney, Melbourne ve Hobart'ta eşsiz doğa ve modern şehir yaşamının büyüleyici kombinasyonu.",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCbe3finMoCAFscjSyB--19YXA2AIqS4O8zz-OpurkLb4yXcvRBccljAHZNz2j29ZqBsxSH-sOXqEnM13OVoAbAYl2ktiwZujKZRpYLE1C_v86otqT21csue2VYtZx8HemLpVCfegMECQNaz2X7F0lG5p2kenR8iCeofRw1a1l7DqNZMHnYBxl_iqtbzTHnTR783IzCgoYtFcU_OKF1Ablc4tIzufHT4_UZQxhl_j6BCfxoGUXzkMqycw",
    nights: 9,
    days: 10,
    startingPrice: 4600,
    currency: "USD",
    capacity: 12,
    themes: ["Kültür Turları", "Macera & Doğa"],
    highlights: [
      { icon: "flight_takeoff", title: "Uçuş Dahil", subtitle: "THY ile Gidiş - Dönüş" },
      { icon: "hotel", title: "Konaklama", subtitle: "4 & 5 Yıldızlı Oteller" },
      { icon: "restaurant", title: "Yemek", subtitle: "Yarım Pansiyon" },
    ],
    includes: [
      "Gidiş-Dönüş Uçak Biletleri",
      "4 ve 5 Yıldızlı Otellerde Konaklama",
      "Havalimanı - Otel Transferleri",
      "Profesyonel Türkçe Rehberlik Hizmeti",
      "Sabah Kahvaltıları ve Akşam Yemekleri",
    ],
    excludes: [
      "Kişisel Harcamalar",
      "Vize Ücretleri",
      "Seyahat Sağlık Sigortası",
      "Öğle Yemekleri",
      "Ekstra Olarak Belirtilen Turlar",
    ],
    importantNotes: [
      "Pasaport geçerlilik süresi seyahat bitiş tarihinden itibaren en az 6 ay olmalıdır.",
      "Buluşma saatlerine kesinlikle uyulması gerekmektedir.",
      "Havayolu kaynaklı uçuş saati değişikliklerinden acentemiz sorumlu değildir.",
      "Gidilecek ülkenin yerel kural ve geleneklerine saygı gösterilmesi önemlidir.",
    ],
  },
  {
    isPopular: false,
    id: "tur-balkanlar-ekspres",
    slug: "ucaklı-buyuk-balkanlar-turu",
    name: "Uçaklı Büyük Balkanlar Turu",
    region: "Balkanlar",
    summary:
      "Bosna Hersek - Karadağ - Arnavutluk - Makedonya - Kosova ekseninde unutulmaz bir kültürel miras yolculuğu.",
    description:
      "Bosna Hersek - Karadağ - Arnavutluk - Makedonya - Kosova ekseninde unutulmaz bir kültürel miras yolculuğu.",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCi-c9LWUjXhERuUjeKWSlYvM5hsH-h99KDE5s_QqumyRBArUBf28aVdX3bMhBRB-Qi3VtZBLojEAMYCcmHtTvVcgYaGufaqwS-TVURLwNLmGs68iQm6CFNYGpyvmINc-amf_FonX2WN90x5eLJl9Ezv3zRIg3vMshyr8BSVy7_OK05aO4YKfMwMG11lL5NrY4H_bC2LE5SEDeGnfkS46E0itCUOQLWMKheZRyxFldl5GD2I_pyM9rnWw",
    nights: 5,
    days: 6,
    startingPrice: 675,
    currency: "EUR",
    capacity: 30,
    themes: ["Kültür Turları"],
    highlights: [
      { icon: "flight_takeoff", title: "Uçuş Dahil", subtitle: "THY ile Gidiş - Dönüş" },
      { icon: "hotel", title: "Konaklama", subtitle: "4 Yıldızlı Oteller" },
      { icon: "restaurant", title: "Yemek", subtitle: "Yarım Pansiyon" },
    ],
    includes: [
      "Gidiş-Dönüş Uçak Biletleri",
      "4 Yıldızlı Otellerde Konaklama",
      "Havalimanı - Otel Transferleri",
      "Profesyonel Türkçe Rehberlik Hizmeti",
    ],
    excludes: ["Kişisel Harcamalar", "Vize Ücretleri", "Seyahat Sağlık Sigortası"],
    importantNotes: [
      "Pasaport geçerlilik süresi seyahat bitiş tarihinden itibaren en az 6 ay olmalıdır.",
      "Buluşma saatlerine kesinlikle uyulması gerekmektedir.",
    ],
  },
  {
    isPopular: false,
    id: "tur-fas-kraliyet",
    slug: "fas-kraliyet-sehirleri-turu",
    name: "Fas Kraliyet Şehirleri Turu",
    region: "Afrika",
    summary:
      "Fas'ın büyüleyici şehirlerinde 5 gece 6 gün sürecek unutulmaz bir keşif: Kazablanka, Rabat, Fez, Meknes...",
    description:
      "Fas'ın büyüleyici şehirlerinde 5 gece 6 gün sürecek unutulmaz bir keşif: Kazablanka, Rabat, Fez, Meknes...",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5xhK45D45VZ3Lty_cYk_lfZcrCFqtDDq5HGFvEg4-xnDkyk5FBrQMiwH7MSOVkYKQZLq9beNznsfVDNc9QHAN1Qt03eXsqOuAZbo2iAiwWewkCs_w9iUCGd5vg8Nh914rSXwhYypdLJB2SbJFaxJVu9JQJfXPB1CFWnxUR-5P3RFu73yrAW0d6OwBS6JJl26g52t1tjEtNbb2Jnu3QH5Q2vKetYdbFxc4uxXDijVPGZS2JfTcR_1_UQ",
    nights: 5,
    days: 6,
    startingPrice: 1250,
    currency: "EUR",
    capacity: 20,
    themes: ["Kültür Turları", "Macera & Doğa"],
    highlights: [
      { icon: "flight_takeoff", title: "Uçuş Dahil", subtitle: "THY ile Gidiş - Dönüş" },
      { icon: "hotel", title: "Konaklama", subtitle: "5 Yıldızlı Oteller" },
      { icon: "restaurant", title: "Yemek", subtitle: "Yarım Pansiyon" },
    ],
    includes: [
      "Gidiş-Dönüş Uçak Biletleri",
      "5 Yıldızlı Otellerde Konaklama",
      "Havalimanı - Otel Transferleri",
      "Profesyonel Türkçe Rehberlik Hizmeti",
    ],
    excludes: ["Kişisel Harcamalar", "Vize Ücretleri", "Öğle Yemekleri"],
    importantNotes: [
      "Gidilecek ülkenin yerel kural ve geleneklerine saygı gösterilmesi önemlidir.",
    ],
  },
  {
    isPopular: false,
    id: "tur-britanya",
    slug: "buyuk-britanya-turu",
    name: "Büyük Britanya Turu",
    region: "Avrupa",
    summary: "Londra ve çevresinde tarih ve modern şehir yaşamını buluşturan 7 gece 8 gün.",
    description:
      "Londra ve çevresinde tarih ve modern şehir yaşamını buluşturan 7 gece 8 gün.",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC00-F5YkLNoQXukUZL3749GFZK1K9-EFL-dkJMd5zooERBdu32tRh1Q8T5ccUmhrCecmea8OWTtQf1dvyZdnTLLfyUxdTiHKcRsTY7T9Z6cfRMWDjOZn-C1Tt5Fs_LY9HbIGOFXLsQGZYc9_Ykvlj9RxajlBbGfmRkgeOP0VgUaicdoiOiHB5L2GK5Qc7DzcgEZDi9LN7lp63fjmN4Dz3Qu7XUwpFtHSnt1FUCTe2sjWh17WgZOvQG7g",
    nights: 7,
    days: 8,
    startingPrice: 990,
    currency: "EUR",
    capacity: 25,
    themes: ["Kültür Turları"],
    highlights: [
      { icon: "flight_takeoff", title: "Uçuş Dahil", subtitle: "THY ile Gidiş - Dönüş" },
      { icon: "hotel", title: "Konaklama", subtitle: "4 Yıldızlı Oteller" },
      { icon: "restaurant", title: "Yemek", subtitle: "Kahvaltı Dahil" },
    ],
    includes: ["Gidiş-Dönüş Uçak Biletleri", "4 Yıldızlı Otellerde Konaklama"],
    excludes: ["Kişisel Harcamalar", "Vize Ücretleri"],
    importantNotes: ["Pasaport geçerlilik süresi en az 6 ay olmalıdır."],
  },
  {
    isPopular: false,
    id: "tur-maldivler",
    slug: "luks-maldivler-balayi",
    name: "Lüks Maldivler Balayı",
    region: "Asya",
    summary: "Maldivler'de eşsiz bir balayı deneyimi; su üstü villalarda unutulmaz anlar.",
    description:
      "Maldivler'de eşsiz bir balayı deneyimi; su üstü villalarda unutulmaz anlar.",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGZGT7DoF7N7f53ZT_PLSVuck_lbEtyO_892Nl7qBf19xuaSlEv9uxY8qSp3iHxslXP9zw6Qz-5ZtaQNtETUfiIjbtiLdUGyjUkKoAlRGC8sMybzpaldyowTh0yZImDAax7fRO-qKjdVVzj93XagadQBY4k05sSBdB6WsqK-YG9yzKPgzwfMNLZJiI_leySyw_TIJJnSSYaZQ2cINfvTYux39f4UkaT6iqTwnSozp373y9klKIPpGkng",
    nights: 6,
    days: 7,
    startingPrice: 3200,
    currency: "USD",
    capacity: 10,
    themes: ["Gemi Turları"],
    highlights: [
      { icon: "flight_takeoff", title: "Uçuş Dahil", subtitle: "Gidiş - Dönüş" },
      { icon: "hotel", title: "Konaklama", subtitle: "Su Üstü Villa" },
      { icon: "restaurant", title: "Yemek", subtitle: "Her Şey Dahil" },
    ],
    includes: ["Gidiş-Dönüş Uçak Biletleri", "Su Üstü Villa Konaklama", "Her Şey Dahil"],
    excludes: ["Kişisel Harcamalar"],
    importantNotes: ["Pasaport geçerlilik süresi en az 6 ay olmalıdır."],
  },
];

export function findMockTourById(id: string): Tour | undefined {
  return mockTours.find((tour) => tour.id === id);
}
