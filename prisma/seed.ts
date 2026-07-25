import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Anggrek Bulan',
    slug: 'anggrek-bulan',
    category: 'Anggrek',
    price: 150000,
    stock: 15,
    description: 'Bunga anggrek putih elegan dengan kelopak lembut, cocok untuk dekorasi interior maupun hadiah istimewa.',
    heroImage: '/assets/images/anggrek%20bulan/pexels-3672527-10537164.jpg',
    images: JSON.stringify([
      '/assets/images/anggrek%20bulan/pexels-3672527-10537164.jpg',
      '/assets/images/anggrek%20bulan/pexels-joseph-george-15117753-6612876.jpg',
      '/assets/images/anggrek%20bulan/pexels-kuba-macioszek-2387091-9365104.jpg',
      '/assets/images/anggrek%20bulan/pexels-robson-zuccolotto-3214763-7459413.jpg',
      '/assets/images/anggrek%20bulan/pexels-steven-van-elk-9757164-19775759.jpg',
    ]),
    infoOrigin: 'Asia Tenggara — Indonesia, Filipina, Malaysia',
    infoLatinName: 'Phalaenopsis amabilis',
    infoMeaning: 'Kecantikan, keanggunan, dan keberuntungan abadi',
    infoHistory: 'Anggrek Bulan pertama kali dideskripsikan secara ilmiah oleh ahli botani Belanda Carl Blume pada tahun 1825 setelah ekspedisinya di Jawa. Nama genus Phalaenopsis berasal dari bahasa Yunani yang berarti menyerupai ngengat, karena kelopaknya yang lebar menyerupai sayap ngengat saat terbang.',
    infoFunFact: 'Anggrek Bulan dapat mekar selama 2–3 bulan penuh dalam satu musim mekar, menjadikannya salah satu bunga hias paling tahan lama di dunia.',
    infoBloomSeason: 'Sepanjang tahun, puncaknya musim dingin–semi',
  },
  {
    name: 'Buket Campuran',
    slug: 'buket-campuran',
    category: 'Buket',
    price: 185000,
    stock: 10,
    description: 'Rangkaian bunga segar campuran penuh warna, sempurna untuk mengungkapkan perasaan di momen spesial.',
    heroImage: '/assets/images/buketcampuran/catherine-kay-greenup-gJJzYZDRieM-unsplash.jpg',
    images: JSON.stringify([
      '/assets/images/buketcampuran/catherine-kay-greenup-gJJzYZDRieM-unsplash.jpg',
      '/assets/images/buketcampuran/denise-milia-ZSox7D8S6M8-unsplash.jpg',
      '/assets/images/buketcampuran/frida-flowers-xtradry-0Je5N1f-z9c-unsplash.jpg',
      '/assets/images/buketcampuran/insung-yoon-Vxm213warDA-unsplash%20(1).jpg',
      '/assets/images/buketcampuran/insung-yoon-Vxm213warDA-unsplash.jpg',
      '/assets/images/buketcampuran/joellee-aguirre-Izqg4RoArSQ-unsplash.jpg',
    ]),
    infoOrigin: 'Tradisi global — berasal dari Eropa abad pertengahan',
    infoLatinName: 'Floral Arrangement / Mixed Bouquet',
    infoMeaning: 'Kegembiraan, perayaan, dan ekspresi perasaan yang tulus',
    infoHistory: 'Seni merangkai bunga telah ada selama ribuan tahun. Di Mesir Kuno, bunga dirangkai untuk persembahan dewa. Tradisi bouquet modern berkembang di Eropa abad ke-17–18 melalui bahasa bunga atau floriografi.',
    infoFunFact: 'Pada era Victorian Inggris, buket bunga digunakan sebagai kode rahasia untuk menyampaikan pesan cinta.',
    infoBloomSeason: 'Tersedia sepanjang tahun sesuai musim',
  },
  {
    name: 'Krisan',
    slug: 'krisan',
    category: 'Krisan',
    price: 75000,
    stock: 20,
    description: 'Bunga krisan segar dengan warna-warna cerah yang menawan, simbol kebahagiaan dan umur panjang.',
    heroImage: '/assets/images/krisan/pexels-aksinfo7-36463833.jpg',
    images: JSON.stringify([
      '/assets/images/krisan/pexels-aksinfo7-36463833.jpg',
      '/assets/images/krisan/pexels-f-2154796291-38291589.jpg',
      '/assets/images/krisan/pexels-jean-paul-wettstein-677916508-35125901.jpg',
      '/assets/images/krisan/pexels-kf-zhou-609625381-19611627.jpg',
      '/assets/images/krisan/pexels-pankaj-yadav-398664566-15426072.jpg',
      '/assets/images/krisan/pexels-photocreator-30702910%20(1).jpg',
      '/assets/images/krisan/pexels-photocreator-30702910.jpg',
      '/assets/images/krisan/pexels-pradeep-kumar-g-2159356198-36106897.jpg',
      '/assets/images/krisan/pexels-suchismita-chatterjee-2160534445-36790781.jpg',
    ]),
    infoOrigin: 'Tiongkok — dibudidayakan sejak 3000 SM',
    infoLatinName: 'Chrysanthemum morifolium',
    infoMeaning: 'Umur panjang, kebahagiaan, kesetiaan, dan persahabatan',
    infoHistory: 'Krisan memiliki sejarah lebih dari 3.000 tahun di Tiongkok. Konon, ahli filsafat Konfusius menyebut krisan sebagai bunga yang ideal. Di Jepang, takhta kaisar disebut Tahta Krisan.',
    infoFunFact: 'Lebih dari 20.000 varietas krisan dikenal di seluruh dunia, dengan warna dari putih, kuning, oranye, merah, ungu, hingga hijau.',
    infoBloomSeason: 'Musim gugur (September – November), namun tersedia sepanjang tahun',
  },
  {
    name: 'Lavender',
    slug: 'lavender',
    category: 'Herb Flower',
    price: 120000,
    stock: 8,
    description: 'Lavender aromatik dengan warna ungu mempesona dan aroma menenangkan yang menyegarkan pikiran.',
    heroImage: '/assets/images/lavender/claire-gray-IjygOuTpEzg-unsplash.jpg',
    images: JSON.stringify([
      '/assets/images/lavender/claire-gray-IjygOuTpEzg-unsplash.jpg',
      '/assets/images/lavender/pexels-darina-baranova-3289491-5411599.jpg',
      '/assets/images/lavender/pexels-kristina-esaulko-2162129248-38019222.jpg',
      '/assets/images/lavender/pexels-rahimegul-9443914.jpg',
      '/assets/images/lavender/pexels-rahimegul-9443918.jpg',
      '/assets/images/lavender/pexels-rahimegul-9443925.jpg',
      '/assets/images/lavender/pexels-tomris-511528011-28936226.jpg',
      '/assets/images/lavender/pexels-van3ssa-peace-love-272678138-32663496.jpg',
      '/assets/images/lavender/szobota-zsuzsi-d-7N6rVLMQM-unsplash.jpg',
      '/assets/images/lavender/volant-HPEgfNHlZSI-unsplash.jpg',
    ]),
    infoOrigin: 'Mediterania, Timur Tengah, dan India Utara',
    infoLatinName: 'Lavandula angustifolia',
    infoMeaning: 'Ketenangan, kemurnian, cinta, dan perlindungan',
    infoHistory: 'Lavender telah digunakan selama lebih dari 2.500 tahun. Bangsa Romawi mencampurkannya ke dalam air mandi mereka — nama lavender berasal dari kata Latin lavare yang berarti mencuci.',
    infoFunFact: 'Penelitian ilmiah membuktikan bahwa mencium aroma lavender selama 3 menit secara signifikan menurunkan kadar kortisol (hormon stres) dalam tubuh.',
    infoBloomSeason: 'Musim panas (Juni – Agustus)',
  },
  {
    name: 'Lili Putih',
    slug: 'lili-putih',
    category: 'Lili',
    price: 165000,
    stock: 12,
    description: 'Lili putih murni dengan aroma harum yang lembut, simbol kesucian dan keanggunan yang abadi.',
    heroImage: '/assets/images/lili%20putih/pexels-ashlee-marie-430174814-15312443.jpg',
    images: JSON.stringify([
      '/assets/images/lili%20putih/pexels-ashlee-marie-430174814-15312443.jpg',
      '/assets/images/lili%20putih/pexels-dagmara-dombrovska-22732579-11986511.jpg',
      '/assets/images/lili%20putih/pexels-dagmara-dombrovska-22732579-11986512.jpg',
      '/assets/images/lili%20putih/pexels-dagmara-dombrovska-22732579-11986514.jpg',
      '/assets/images/lili%20putih/pexels-darya-grey_owl-132130036-17406664.jpg',
      '/assets/images/lili%20putih/pexels-darya-grey_owl-132130036-17406667.jpg',
    ]),
    infoOrigin: 'Eropa, Asia Tengah, dan kawasan Mediterania',
    infoLatinName: 'Lilium candidum',
    infoMeaning: 'Kesucian, keanggunan, kelahiran kembali, dan keabadian',
    infoHistory: 'Lili putih adalah salah satu bunga tertua yang dibudidayakan manusia, dengan bukti arkeologis penggunaan lili di Kreta sejak 1500 SM. Bangsa Yunani kuno mengaitkannya dengan dewi Hera.',
    infoFunFact: 'Lili putih dapat tumbuh hingga 1,8 meter dan menghasilkan aroma yang lebih kuat di malam hari untuk menarik penyerbuk nokturnal.',
    infoBloomSeason: 'Akhir musim semi hingga musim panas (Mei – Juli)',
  },
  {
    name: 'Bunga Matahari',
    slug: 'bunga-matahari',
    category: 'Matahari',
    price: 90000,
    stock: 18,
    description: 'Bunga matahari ceria yang memancarkan kehangatan dan kebahagiaan, cocok untuk semua kesempatan.',
    heroImage: '/assets/images/matahari/pexels-ian-panelo-3728348.jpg',
    images: JSON.stringify([
      '/assets/images/matahari/pexels-ian-panelo-3728348.jpg',
      '/assets/images/matahari/pexels-aysenaz-bilgin-421884106-17683260.jpg',
      '/assets/images/matahari/pexels-fotios-photos-38654639.jpg',
      '/assets/images/matahari/pexels-inga-sv-10841431.jpg',
      '/assets/images/matahari/pexels-jake-35524820.jpg',
      '/assets/images/matahari/pexels-marta-dzedyshko-1042863-7175407.jpg',
      '/assets/images/matahari/pexels-mrgajowy3-teodor-2158318376-36156278.jpg',
      '/assets/images/matahari/pexels-patrick-nizan-115343504-17564239.jpg',
      '/assets/images/matahari/pexels-yananadolinska-17890606.jpg',
    ]),
    infoOrigin: 'Amerika Utara — dibudidayakan suku asli sejak 3000 SM',
    infoLatinName: 'Helianthus annuus',
    infoMeaning: 'Kesetiaan, kebahagiaan, harapan, dan kekaguman',
    infoHistory: 'Bunga matahari adalah asli Amerika Utara dan telah dibudidayakan oleh suku-suku asli seperti Aztec dan Inca sejak ribuan tahun lalu sebagai sumber pangan, minyak, dan obat-obatan.',
    infoFunFact: 'Bunga matahari muda menunjukkan fenomena heliotropisme — batangnya bergerak mengikuti arah matahari dari timur ke barat sepanjang hari.',
    infoBloomSeason: 'Musim panas (Juli – September)',
  },
  {
    name: 'Red Rose',
    slug: 'red-rose',
    category: 'Mawar',
    price: 250000,
    stock: 5,
    description: 'Mawar merah klasik dengan keharuman khas, lambang cinta dan romansa yang abadi tak lekang waktu.',
    heroImage: '/assets/images/red-rose/pexels-250d-10188221.jpg',
    images: JSON.stringify([
      '/assets/images/red-rose/pexels-250d-10188221.jpg',
      '/assets/images/red-rose/pexels-borishamer-13977751.jpg',
      '/assets/images/red-rose/pexels-ilias-saltidis-488992979-15959807.jpg',
      '/assets/images/red-rose/pexels-mikegles-33703928.jpg',
      '/assets/images/red-rose/pexels-senori-64457218-19478946.jpg',
    ]),
    infoOrigin: 'Asia, Eropa, dan Amerika Utara — tersebar di seluruh dunia',
    infoLatinName: 'Rosa × hybrida',
    infoMeaning: 'Cinta yang dalam, gairah, romansa, dan keindahan sempurna',
    infoHistory: 'Mawar adalah bunga dengan sejarah paling kaya dalam peradaban manusia. Fosil mawar berusia 35 juta tahun ditemukan di Colorado. Cleopatra dikabarkan mengisi kamarnya dengan kelopak mawar setinggi 60 cm.',
    infoFunFact: 'Minyak esensial mawar adalah yang paling mahal di dunia — dibutuhkan sekitar 3,5 ton kelopak untuk menghasilkan 1 kg minyak.',
    infoBloomSeason: 'Musim semi dan gugur (April–Juni, September–Oktober)',
  },
  {
    name: "Baby's Breath",
    slug: 'babys-breath',
    category: 'Gypsophila',
    price: 65000,
    stock: 25,
    description: 'Bunga kecil nan memesona dengan tampilan minimalis yang elegan. Sempurna sebagai rangkaian mandiri maupun pelengkap buket.',
    heroImage: "/assets/images/baby%27s%20breath/armennano-flowers-6885306.jpg",
    images: JSON.stringify([
      "/assets/images/baby%27s%20breath/armennano-flowers-6885306.jpg",
      "/assets/images/baby%27s%20breath/digitalphotolinds-flowers-1216049.jpg",
      "/assets/images/baby%27s%20breath/neelam279-chrysanthemum-6149833.jpg",
      "/assets/images/baby%27s%20breath/tfirdous051020011-coffee-6401190.jpg",
    ]),
    infoOrigin: 'Eropa Tengah, Asia, dan Afrika Utara',
    infoLatinName: 'Gypsophila paniculata',
    infoMeaning: 'Kejujuran, kemurnian, cinta abadi, dan kepolosan',
    infoHistory: "Baby's Breath telah digunakan dalam seni merangkai bunga sejak era Victoria sebagai simbol innocence dan kemurnian. Namanya merujuk pada kelembutannya yang menyerupai embusan napas bayi.",
    infoFunFact: "Satu tangkai Baby's Breath bisa memiliki lebih dari 1.000 bunga kecil.",
    infoBloomSeason: 'Musim panas (Juni – Agustus)',
  },
  {
    name: 'Hydrangea',
    slug: 'hydrangea',
    category: 'Hortensia',
    price: 175000,
    stock: 9,
    description: 'Bunga hortensia dengan kelompok kelopak lebat yang memukau, hadir dalam nuansa biru, ungu, dan pink.',
    heroImage: '/assets/images/hydrangea/couleur-hydrangea-3487664.jpg',
    images: JSON.stringify([
      '/assets/images/hydrangea/couleur-hydrangea-3487664.jpg',
      '/assets/images/hydrangea/hans-garden-hydrangea-4134289.jpg',
      '/assets/images/hydrangea/janetrr-blue-hydrangea-flower-1544194.jpg',
      '/assets/images/hydrangea/marabarboza-hydrangea-macrophylla-4619715.jpg',
      '/assets/images/hydrangea/nennieinszweidrei-hydrangea-7271909.jpg',
    ]),
    infoOrigin: 'Jepang, Tiongkok, Korea, dan Amerika Utara',
    infoLatinName: 'Hydrangea macrophylla',
    infoMeaning: 'Rasa terima kasih, ketulusan, pemahaman mendalam, dan kelimpahan',
    infoHistory: 'Hydrangea pertama kali ditemukan di Jepang, di mana ia dikenal sebagai Ajisai. Dibawa ke Eropa oleh penjelajah Belanda Philipp Franz von Siebold pada abad ke-18.',
    infoFunFact: 'Warna bunga hydrangea dipengaruhi langsung oleh pH tanah — tanah asam menghasilkan bunga biru, tanah basa menghasilkan bunga merah muda.',
    infoBloomSeason: 'Musim panas hingga awal gugur (Juni – Oktober)',
  },
];

async function main() {
  console.log('🌸 Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // ── Seed users ─────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash  = await bcrypt.hash('user123',  10);

  await prisma.user.createMany({
    data: [
      {
        id:       1,
        name:     'Admin Bloom',
        username: 'admin',
        email:    'admin@bloom.com',
        password: adminHash,
        role:     'admin',
      },
      {
        id:       2,
        name:     'Pengguna Demo',
        username: 'user',
        email:    'user@bloom.com',
        password: userHash,
        role:     'customer',
      },
    ],
  });
  console.log('✅ Seeded 2 users (admin + demo)');

  // Insert products
  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ Seeded ${products.length} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
