import { Product } from "@/types";

export const products: Product[] = [
  {
    id: 1,
    name: "Anggrek Bulan",
    slug: "anggrek-bulan",
    category: "Anggrek",
    price: 150_000,
    stock: 15,
    description:
      "Bunga anggrek putih elegan dengan kelopak lembut, cocok untuk dekorasi interior maupun hadiah istimewa.",
    heroImage: "/assets/images/anggrek%20bulan/pexels-3672527-10537164.jpg",
    images: [
      "/assets/images/anggrek%20bulan/pexels-3672527-10537164.jpg",
      "/assets/images/anggrek%20bulan/pexels-joseph-george-15117753-6612876.jpg",
      "/assets/images/anggrek%20bulan/pexels-kuba-macioszek-2387091-9365104.jpg",
      "/assets/images/anggrek%20bulan/pexels-robson-zuccolotto-3214763-7459413.jpg",
      "/assets/images/anggrek%20bulan/pexels-steven-van-elk-9757164-19775759.jpg",
    ],
    info: {
      origin: "Asia Tenggara — Indonesia, Filipina, Malaysia",
      latinName: "Phalaenopsis amabilis",
      meaning: "Kecantikan, keanggunan, dan keberuntungan abadi",
      history:
        "Anggrek Bulan pertama kali dideskripsikan secara ilmiah oleh ahli botani Belanda Carl Blume pada tahun 1825 setelah ekspedisinya di Jawa. Nama genus 'Phalaenopsis' berasal dari bahasa Yunani yang berarti 'menyerupai ngengat', karena kelopaknya yang lebar menyerupai sayap ngengat saat terbang. Di Indonesia, bunga ini telah lama dikenal sebagai simbol kemewahan dan keindahan alam Nusantara, bahkan dinobatkan sebagai salah satu Puspa Pesona Indonesia.",
      funFact:
        "Anggrek Bulan dapat mekar selama 2–3 bulan penuh dalam satu musim mekar, menjadikannya salah satu bunga hias paling tahan lama di dunia.",
      bloomSeason: "Sepanjang tahun, puncaknya musim dingin–semi",
    },
  },
  {
    id: 2,
    name: "Buket Campuran",
    slug: "buket-campuran",
    category: "Buket",
    price: 185_000,
    stock: 10,
    description:
      "Rangkaian bunga segar campuran penuh warna, sempurna untuk mengungkapkan perasaan di momen spesial.",
    heroImage:
      "/assets/images/buketcampuran/catherine-kay-greenup-gJJzYZDRieM-unsplash.jpg",
    images: [
      "/assets/images/buketcampuran/catherine-kay-greenup-gJJzYZDRieM-unsplash.jpg",
      "/assets/images/buketcampuran/denise-milia-ZSox7D8S6M8-unsplash.jpg",
      "/assets/images/buketcampuran/frida-flowers-xtradry-0Je5N1f-z9c-unsplash.jpg",
      "/assets/images/buketcampuran/insung-yoon-Vxm213warDA-unsplash%20(1).jpg",
      "/assets/images/buketcampuran/insung-yoon-Vxm213warDA-unsplash.jpg",
      "/assets/images/buketcampuran/joellee-aguirre-Izqg4RoArSQ-unsplash.jpg",
    ],
    info: {
      origin: "Tradisi global — berasal dari Eropa abad pertengahan",
      latinName: "Floral Arrangement / Mixed Bouquet",
      meaning: "Kegembiraan, perayaan, dan ekspresi perasaan yang tulus",
      history:
        "Seni merangkai bunga (floral arrangement) telah ada selama ribuan tahun. Di Mesir Kuno, bunga dirangkai untuk persembahan dewa dan penghormatan orang meninggal. Tradisi bouquet modern seperti yang kita kenal berkembang pesat di Eropa abad ke-17–18, di mana buket dijadikan media komunikasi perasaan melalui 'bahasa bunga' atau floriografi. Setiap kombinasi bunga memiliki pesan tersendiri yang disampaikan kepada penerimanya.",
      funFact:
        "Pada era Victorian Inggris, buket bunga digunakan sebagai kode rahasia untuk menyampaikan pesan cinta yang tidak bisa diucapkan langsung.",
      bloomSeason: "Tersedia sepanjang tahun sesuai musim",
    },
  },
  {
    id: 3,
    name: "Krisan",
    slug: "krisan",
    category: "Krisan",
    price: 75_000,
    stock: 20,
    description:
      "Bunga krisan segar dengan warna-warna cerah yang menawan, simbol kebahagiaan dan umur panjang.",
    heroImage: "/assets/images/krisan/pexels-aksinfo7-36463833.jpg",
    images: [
      "/assets/images/krisan/pexels-aksinfo7-36463833.jpg",
      "/assets/images/krisan/pexels-f-2154796291-38291589.jpg",
      "/assets/images/krisan/pexels-jean-paul-wettstein-677916508-35125901.jpg",
      "/assets/images/krisan/pexels-kf-zhou-609625381-19611627.jpg",
      "/assets/images/krisan/pexels-pankaj-yadav-398664566-15426072.jpg",
      "/assets/images/krisan/pexels-photocreator-30702910%20(1).jpg",
      "/assets/images/krisan/pexels-photocreator-30702910.jpg",
      "/assets/images/krisan/pexels-pradeep-kumar-g-2159356198-36106897.jpg",
      "/assets/images/krisan/pexels-suchismita-chatterjee-2160534445-36790781.jpg",
    ],
    info: {
      origin: "Tiongkok — dibudidayakan sejak 3000 SM",
      latinName: "Chrysanthemum morifolium",
      meaning: "Umur panjang, kebahagiaan, kesetiaan, dan persahabatan",
      history:
        "Krisan memiliki sejarah lebih dari 3.000 tahun di Tiongkok, di mana ia pertama kali dibudidayakan sebagai tanaman obat. Konon, ahli filsafat Konfusius menyebut krisan sebagai bunga yang ideal dalam tulisannya. Dari Tiongkok, krisan dibawa ke Jepang sekitar abad ke-8 dan menjadi simbol kekaisaran Jepang — takhta kaisar Jepang bahkan disebut 'Tahta Krisan'. Di Indonesia, krisan menjadi salah satu bunga potong komersial terpenting.",
      funFact:
        "Lebih dari 20.000 varietas krisan dikenal di seluruh dunia, dengan warna dari putih, kuning, oranye, merah, ungu, hingga hijau.",
      bloomSeason: "Musim gugur (September – November), namun tersedia sepanjang tahun",
    },
  },
  {
    id: 4,
    name: "Lavender",
    slug: "lavender",
    category: "Herb Flower",
    price: 120_000,
    stock: 8,
    description:
      "Lavender aromatik dengan warna ungu mempesona dan aroma menenangkan yang menyegarkan pikiran.",
    heroImage: "/assets/images/lavender/claire-gray-IjygOuTpEzg-unsplash.jpg",
    images: [
      "/assets/images/lavender/claire-gray-IjygOuTpEzg-unsplash.jpg",
      "/assets/images/lavender/pexels-darina-baranova-3289491-5411599.jpg",
      "/assets/images/lavender/pexels-kristina-esaulko-2162129248-38019222.jpg",
      "/assets/images/lavender/pexels-rahimegul-9443914.jpg",
      "/assets/images/lavender/pexels-rahimegul-9443918.jpg",
      "/assets/images/lavender/pexels-rahimegul-9443925.jpg",
      "/assets/images/lavender/pexels-tomris-511528011-28936226.jpg",
      "/assets/images/lavender/pexels-van3ssa-peace-love-272678138-32663496.jpg",
      "/assets/images/lavender/szobota-zsuzsi-d-7N6rVLMQM-unsplash.jpg",
      "/assets/images/lavender/volant-HPEgfNHlZSI-unsplash.jpg",
    ],
    info: {
      origin: "Mediterania, Timur Tengah, dan India Utara",
      latinName: "Lavandula angustifolia",
      meaning: "Ketenangan, kemurnian, cinta, dan perlindungan",
      history:
        "Lavender telah digunakan selama lebih dari 2.500 tahun. Bangsa Mesir Kuno menggunakannya dalam proses mumifikasi dan parfum. Bangsa Romawi mencampurkannya ke dalam air mandi mereka — nama 'lavender' sendiri berasal dari kata Latin 'lavare' yang berarti 'mencuci'. Di abad pertengahan, lavender dijadikan jimat untuk mengusir wabah dan roh jahat. Saat ini, industri minyak lavender menjadi tulang punggung ekonomi wilayah Provence, Prancis.",
      funFact:
        "Penelitian ilmiah membuktikan bahwa mencium aroma lavender selama 3 menit secara signifikan menurunkan kadar kortisol (hormon stres) dalam tubuh.",
      bloomSeason: "Musim panas (Juni – Agustus)",
    },
  },
  {
    id: 5,
    name: "Lili Putih",
    slug: "lili-putih",
    category: "Lili",
    price: 165_000,
    stock: 12,
    description:
      "Lili putih murni dengan aroma harum yang lembut, simbol kesucian dan keanggunan yang abadi.",
    heroImage:
      "/assets/images/lili%20putih/pexels-ashlee-marie-430174814-15312443.jpg",
    images: [
      "/assets/images/lili%20putih/pexels-ashlee-marie-430174814-15312443.jpg",
      "/assets/images/lili%20putih/pexels-dagmara-dombrovska-22732579-11986511.jpg",
      "/assets/images/lili%20putih/pexels-dagmara-dombrovska-22732579-11986512.jpg",
      "/assets/images/lili%20putih/pexels-dagmara-dombrovska-22732579-11986514.jpg",
      "/assets/images/lili%20putih/pexels-darya-grey_owl-132130036-17406664.jpg",
      "/assets/images/lili%20putih/pexels-darya-grey_owl-132130036-17406667.jpg",
    ],
    info: {
      origin: "Eropa, Asia Tengah, dan kawasan Mediterania",
      latinName: "Lilium candidum",
      meaning: "Kesucian, keanggunan, kelahiran kembali, dan keabadian",
      history:
        "Lili putih adalah salah satu bunga tertua yang dibudidayakan manusia, dengan bukti arkeologis penggunaan lili di Kreta sejak 1500 SM. Bangsa Yunani kuno mengaitkannya dengan dewi Hera, sedangkan bangsa Romawi menghubungkannya dengan Venus. Dalam tradisi Kristen, lili putih menjadi simbol Bunda Maria dan kesucian ilahi. Di Eropa abad pertengahan, lili putih ditanam di taman biara sebagai tanaman suci.",
      funFact:
        "Lili putih dapat tumbuh hingga 1,8 meter dan menghasilkan aroma yang lebih kuat di malam hari untuk menarik penyerbuk nokturnal seperti ngengat.",
      bloomSeason: "Akhir musim semi hingga musim panas (Mei – Juli)",
    },
  },
  {
    id: 6,
    name: "Bunga Matahari",
    slug: "bunga-matahari",
    category: "Matahari",
    price: 90_000,
    stock: 18,
    description:
      "Bunga matahari ceria yang memancarkan kehangatan dan kebahagiaan, cocok untuk semua kesempatan.",
    heroImage: "/assets/images/matahari/pexels-ian-panelo-3728348.jpg",
    images: [
      "/assets/images/matahari/pexels-ian-panelo-3728348.jpg",
      "/assets/images/matahari/pexels-aysenaz-bilgin-421884106-17683260.jpg",
      "/assets/images/matahari/pexels-fotios-photos-38654639.jpg",
      "/assets/images/matahari/pexels-inga-sv-10841431.jpg",
      "/assets/images/matahari/pexels-jake-35524820.jpg",
      "/assets/images/matahari/pexels-marta-dzedyshko-1042863-7175407.jpg",
      "/assets/images/matahari/pexels-mrgajowy3-teodor-2158318376-36156278.jpg",
      "/assets/images/matahari/pexels-patrick-nizan-115343504-17564239.jpg",
      "/assets/images/matahari/pexels-yananadolinska-17890606.jpg",
    ],
    info: {
      origin: "Amerika Utara — dibudidayakan suku asli sejak 3000 SM",
      latinName: "Helianthus annuus",
      meaning: "Kesetiaan, kebahagiaan, harapan, dan kekaguman",
      history:
        "Bunga matahari adalah asli Amerika Utara dan telah dibudidayakan oleh suku-suku asli seperti Aztec dan Inca sejak ribuan tahun lalu — bukan hanya sebagai bunga hias, tetapi juga sebagai sumber pangan, minyak, obat-obatan, dan pigmen warna untuk seni. Bangsa Aztec memuja bunga matahari sebagai simbol dewa matahari Huitzilopochtli. Bunga matahari dibawa ke Eropa oleh penjelajah Spanyol sekitar tahun 1500-an dan kemudian menyebar ke seluruh dunia.",
      funFact:
        "Bunga matahari muda menunjukkan fenomena 'heliotropisme' — batangnya bergerak mengikuti arah matahari dari timur ke barat sepanjang hari, lalu kembali ke timur di malam hari.",
      bloomSeason: "Musim panas (Juli – September)",
    },
  },
  {
    id: 7,
    name: "Red Rose",
    slug: "red-rose",
    category: "Mawar",
    price: 250_000,
    stock: 5,
    description:
      "Mawar merah klasik dengan keharuman khas, lambang cinta dan romansa yang abadi tak lekang waktu.",
    heroImage: "/assets/images/red-rose/pexels-250d-10188221.jpg",
    images: [
      "/assets/images/red-rose/pexels-250d-10188221.jpg",
      "/assets/images/red-rose/pexels-borishamer-13977751.jpg",
      "/assets/images/red-rose/pexels-ilias-saltidis-488992979-15959807.jpg",
      "/assets/images/red-rose/pexels-mikegles-33703928.jpg",
      "/assets/images/red-rose/pexels-senori-64457218-19478946.jpg",
    ],
    info: {
      origin: "Asia, Eropa, dan Amerika Utara — tersebar di seluruh dunia",
      latinName: "Rosa × hybrida",
      meaning: "Cinta yang dalam, gairah, romansa, dan keindahan sempurna",
      history:
        "Mawar adalah bunga dengan sejarah paling kaya dalam peradaban manusia. Fosil mawar berusia 35 juta tahun ditemukan di Colorado, Amerika. Bangsa Romawi menggunakan kelopak mawar untuk menghiasi pesta dan upacara. Di abad pertengahan, mawar merah menjadi simbol rahasia — ungkapan 'sub rosa' (di bawah bunga mawar) berarti percakapan rahasia. Cleopatra dikabarkan mengisi kamarnya dengan kelopak mawar setinggi 60 cm untuk menyambut kekasihnya.",
      funFact:
        "Mawar adalah bunga nasional Amerika Serikat sejak 1986. Minyak esensial mawar adalah yang paling mahal di dunia — dibutuhkan sekitar 3,5 ton kelopak untuk menghasilkan 1 kg minyak.",
      bloomSeason: "Musim semi dan gugur (April–Juni, September–Oktober)",
    },
  },
  {
    id: 8,
    name: "Baby's Breath",
    slug: "babys-breath",
    category: "Gypsophila",
    price: 65_000,
    stock: 25,
    description:
      "Bunga kecil nan memesona dengan tampilan minimalis yang elegan. Sempurna sebagai rangkaian mandiri maupun pelengkap buket untuk sentuhan akhir yang airy dan feminin.",
    heroImage:
      "/assets/images/babys-breath/armennano-flowers-6885306.jpg",
    images: [
      "/assets/images/babys-breath/armennano-flowers-6885306.jpg",
      "/assets/images/babys-breath/digitalphotolinds-flowers-1216049.jpg",
      "/assets/images/babys-breath/neelam279-chrysanthemum-6149833.jpg",
      "/assets/images/babys-breath/tfirdous051020011-coffee-6401190.jpg",
    ],
    info: {
      origin: "Eropa Tengah, Asia, dan Afrika Utara",
      latinName: "Gypsophila paniculata",
      meaning: "Kejujuran, kemurnian, cinta abadi, dan kepolosan",
      history:
        "Baby's Breath atau Gypsophila telah digunakan dalam seni merangkai bunga sejak era Victoria (abad ke-19) sebagai simbol innocence dan kemurnian. Namanya 'Baby's Breath' merujuk pada kelembutannya yang menyerupai embusan napas bayi. Bunga ini berasal dari padang rumput berbatu di Eropa Tengah dan tumbuh subur di tanah berkapur (gypsum) — itulah asal nama ilmiahnya 'Gypsophila' dari bahasa Yunani yang berarti 'pencinta kapur'.",
      funFact:
        "Satu tangkai Baby's Breath bisa memiliki lebih dari 1.000 bunga kecil, menjadikannya simbol tak terhitung banyaknya momen kebahagiaan.",
      bloomSeason: "Musim panas (Juni – Agustus)",
    },
  },
  {
    id: 9,
    name: "Hydrangea",
    slug: "hydrangea",
    category: "Hortensia",
    price: 175_000,
    stock: 9,
    description:
      "Bunga hortensia dengan kelompok kelopak lebat yang memukau, hadir dalam nuansa biru, ungu, dan pink. Pilihan favorit untuk dekorasi pernikahan dan hadiah eksklusif.",
    heroImage: "/assets/images/hydrangea/couleur-hydrangea-3487664.jpg",
    images: [
      "/assets/images/hydrangea/couleur-hydrangea-3487664.jpg",
      "/assets/images/hydrangea/hans-garden-hydrangea-4134289.jpg",
      "/assets/images/hydrangea/janetrr-blue-hydrangea-flower-1544194.jpg",
      "/assets/images/hydrangea/marabarboza-hydrangea-macrophylla-4619715.jpg",
      "/assets/images/hydrangea/nennieinszweidrei-hydrangea-7271909.jpg",
    ],
    info: {
      origin: "Jepang, Tiongkok, Korea, dan Amerika Utara",
      latinName: "Hydrangea macrophylla",
      meaning: "Rasa terima kasih, ketulusan, pemahaman mendalam, dan kelimpahan",
      history:
        "Hydrangea pertama kali ditemukan di Jepang, di mana ia dikenal sebagai 'Ajisai' dan memiliki makna budaya yang dalam. Bunga ini dibawa ke Eropa oleh penjelajah Belanda Philipp Franz von Siebold pada abad ke-18, yang menamainya 'Hortensia' untuk menghormati seorang wanita yang dicintainya. Nama ilmiah 'Hydrangea' berasal dari bahasa Yunani 'hydor' (air) dan 'angeion' (wadah), karena bentuk kapsul bijinya yang menyerupai cangkir air.",
      funFact:
        "Warna bunga hydrangea dipengaruhi langsung oleh pH tanah — tanah asam menghasilkan bunga biru, tanah basa menghasilkan bunga merah muda, dan tanah netral menghasilkan ungu.",
      bloomSeason: "Musim panas hingga awal gugur (Juni – Oktober)",
    },
  },
];

/** Format IDR currency: 150000 → "Rp 150.000" */
export function formatRupiah(value: number): string {
  return "Rp " + value.toLocaleString("id-ID");
}
