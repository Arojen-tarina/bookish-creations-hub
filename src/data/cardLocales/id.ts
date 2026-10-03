// Korttitekstit (id): n = nimi, d = kuvaus, e = efekti, c = hinta, s = lyhyt efekti kortin alaosaan.
import type { CardLocale } from './index.ts';

const cards: CardLocale = {
 "res-001": {
  "n": "Kuda Mongol",
  "d": "3 kuda",
  "e": "Rekrut kavaleri",
  "s": "+3 kuda"
 },
 "res-002": {
  "n": "Kawanan Kuda Liar",
  "d": "5 kuda",
  "e": "Cadangan kuda besar",
  "s": "+5 kuda"
 },
 "res-003": {
  "n": "Kuda Perang",
  "d": "2 kuda terlatih",
  "e": "+1 serangan kavaleri",
  "s": "+2 kuda"
 },
 "res-004": {
  "n": "Peternakan Kuda",
  "d": "1 kuda per giliran",
  "e": "Produksi kuda berkelanjutan",
  "s": "+3 kuda"
 },
 "res-005": {
  "n": "Jantan Steppe",
  "d": "1 kuda istimewa",
  "e": "Tunggangan kepala suku (+1 gerakan)",
  "s": "+1 kuda istimewa"
 },
 "res-006": {
  "n": "Perawatan Kuda",
  "d": "2 kuda + perawatan",
  "e": "Kuda tidak mengonsumsi makanan",
  "s": "+2 kuda"
 },
 "res-007": {
  "n": "Kawanan Anak Kuda",
  "d": "4 kuda",
  "e": "Kuda baru",
  "s": "+4 kuda"
 },
 "res-008": {
  "n": "Kuda Kafilah",
  "d": "3 kuda",
  "e": "Untuk perdagangan",
  "s": "+3 kuda"
 },
 "res-009": {
  "n": "Kuda Arab Persia",
  "d": "2 kuda cepat",
  "e": "+2 gerak kavaleri",
  "s": "+2 kuda"
 },
 "res-010": {
  "n": "Jantan Legendaris",
  "d": "1 kuda ajaib",
  "e": "Kepala suku +2 di semua pertempuran",
  "s": "+1 kuda istimewa"
 },
 "res-011": {
  "n": "Koin Emas",
  "d": "3 emas",
  "e": "Alat pembayaran",
  "s": "+3 emas"
 },
 "res-012": {
  "n": "Peti Harta",
  "d": "5 emas",
  "e": "Cadangan emas besar",
  "s": "+5 emas"
 },
 "res-013": {
  "n": "Uang Sutra",
  "d": "4 emas",
  "e": "Mata uang Tiongkok",
  "s": "+4 emas"
 },
 "res-014": {
  "n": "Harta Rampasan",
  "d": "6 emas",
  "e": "Rampasan perang",
  "s": "+6 emas"
 },
 "res-015": {
  "n": "Laba Pedagang",
  "d": "3 emas + 1 per rute dagang",
  "e": "Keuntungan dagang",
  "s": "+3 emas"
 },
 "res-017": {
  "n": "Tambang Emas",
  "d": "2 emas per giliran",
  "e": "Produksi emas berkelanjutan",
  "s": "+5 emas"
 },
 "res-018": {
  "n": "Dana Suap",
  "d": "4 emas",
  "e": "Beli pengaruh",
  "s": "+4 emas"
 },
 "res-019": {
  "n": "Pemasukan Pajak",
  "d": "1 emas per provinsi yang dikuasai",
  "e": "Dari sistem pajak",
  "s": "+3 emas"
 },
 "res-020": {
  "n": "Harta Khan",
  "d": "10 emas",
  "e": "Kekayaan besar",
  "s": "+10 emas"
 },
 "res-021": {
  "n": "Panen Gandum",
  "d": "4 makanan",
  "e": "Perbekalan tentara",
  "s": "+4 makanan"
 },
 "res-022": {
  "n": "Daging Sapi",
  "d": "3 makanan",
  "e": "Cadangan protein",
  "s": "+3 makanan"
 },
 "res-023": {
  "n": "Makanan Kering",
  "d": "5 makanan",
  "e": "Tidak mudah busuk",
  "s": "+5 makanan"
 },
 "res-024": {
  "n": "Kebun Buah",
  "d": "2 makanan per giliran",
  "e": "Produksi berkelanjutan",
  "s": "+4 makanan"
 },
 "res-025": {
  "n": "Hasil Tangkapan",
  "d": "4 makanan",
  "e": "Dari provinsi sungai",
  "s": "+4 makanan"
 },
 "res-026": {
  "n": "Cadangan Makanan",
  "d": "6 makanan",
  "e": "Persediaan darurat",
  "s": "+6 makanan"
 },
 "res-027": {
  "n": "Hasil Buruan",
  "d": "2 makanan",
  "e": "Dari perburuan",
  "s": "+2 makanan"
 },
 "res-028": {
  "n": "Teknologi Pertanian",
  "d": "+1 makanan per lahan tani",
  "e": "Panen meningkat",
  "s": "+3 makanan"
 },
 "res-029": {
  "n": "Sawah Padi",
  "d": "3 makanan",
  "e": "Dari pertanian Tiongkok",
  "s": "+3 makanan"
 },
 "res-030": {
  "n": "Kelimpahan",
  "d": "8 makanan",
  "e": "Panen besar",
  "s": "+8 makanan"
 },
 "res-031": {
  "n": "Pandai Besi",
  "d": "2 pengrajin",
  "e": "Pembuatan senjata",
  "s": "+2 pengrajin"
 },
 "res-032": {
  "n": "Insinyur Tiongkok",
  "d": "3 pengrajin",
  "e": "Pembuat mesin kepung",
  "s": "+3 pengrajin"
 },
 "res-033": {
  "n": "Empu Persia",
  "d": "4 pengrajin",
  "e": "Keahlian bermutu tinggi",
  "s": "+4 pengrajin"
 },
 "res-034": {
  "n": "Penenun",
  "d": "2 pengrajin",
  "e": "Produksi tekstil",
  "s": "+2 pengrajin"
 },
 "res-035": {
  "n": "Pembangun",
  "d": "3 pengrajin",
  "e": "Pembangunan benteng",
  "s": "+3 pengrajin"
 },
 "res-036": {
  "n": "Tukang Tembikar",
  "d": "1 pengrajin",
  "e": "Barang dagang",
  "s": "+1 pengrajin"
 },
 "res-037": {
  "n": "Bengkel Perak",
  "d": "2 pengrajin",
  "e": "Pembuatan perhiasan",
  "s": "+2 pengrajin"
 },
 "res-038": {
  "n": "Empu Senjata",
  "d": "Keahlian legendaris",
  "e": "Bonus serangan +1 permanen",
  "s": "+3 pengrajin"
 },
 "res-039": {
  "n": "Serikat Pengrajin",
  "d": "1 pengrajin per giliran",
  "e": "Produksi berkelanjutan",
  "s": "+4 pengrajin"
 },
 "res-040": {
  "n": "Magang",
  "d": "1 pengrajin",
  "e": "Seorang pemula",
  "s": "+1 pengrajin"
 },
 "res-041": {
  "n": "Kawanan Domba",
  "d": "4 ternak",
  "e": "Wol dan daging",
  "s": "+4 makanan"
 },
 "res-042": {
  "n": "Kawanan Sapi",
  "d": "3 ternak",
  "e": "Hewan pekerja dan daging",
  "s": "+3 makanan"
 },
 "res-043": {
  "n": "Kafilah Unta",
  "d": "5 ternak",
  "e": "Untuk dagang gurun",
  "s": "+5 makanan"
 },
 "res-044": {
  "n": "Kawanan Kambing",
  "d": "3 ternak",
  "e": "Susu dan kulit",
  "s": "+3 makanan"
 },
 "res-045": {
  "n": "Yak",
  "d": "2 ternak",
  "e": "Hewan pegunungan",
  "s": "+2 makanan"
 },
 "res-046": {
  "n": "Peternakan Ulat Sutra",
  "d": "Barang khusus",
  "e": "+2 emas dari perdagangan",
  "s": "+2 emas"
 },
 "res-047": {
  "n": "Rempah-rempah",
  "d": "Barang langka",
  "e": "+3 emas saat diperdagangkan",
  "s": "+3 emas"
 },
 "res-048": {
  "n": "Bulu Binatang",
  "d": "Berharga",
  "e": "+2 emas dari perdagangan",
  "s": "+2 emas"
 },
 "res-049": {
  "n": "Permata",
  "d": "Berlian dan rubi",
  "e": "+10 emas",
  "s": "+4 emas"
 },
 "res-050": {
  "n": "Tiara Khan",
  "d": "Perhiasan kerajaan",
  "e": "+20 emas",
  "s": "+8 emas"
 },
 "str-001": {
  "n": "Serbuan Mongol",
  "d": "Serangan kavaleri klasik",
  "e": "Bonus serangan +3 giliran ini",
  "s": "+3 serangan"
 },
 "str-006": {
  "n": "Hujan Panah",
  "d": "Rentetan panah besar",
  "e": "+1 serangan per unit kavaleri",
  "s": "+1 per kavaleri"
 },
 "str-008": {
  "n": "Taktikus Kekacauan",
  "d": "Tebar kekacauan di barisan musuh",
  "e": "Musuh kehilangan satu unit sebelum pertempuran",
  "s": "+4 serangan"
 },
 "str-010": {
  "n": "Sumpah Darah",
  "d": "Bertarung sampai mati",
  "e": "+2 pertahanan, tidak bisa mundur",
  "s": "+2 pertahanan, tanpa mundur"
 },
 "str-011": {
  "n": "Amuk Api",
  "d": "Panah berapi",
  "e": "Hancurkan sebuah bangunan musuh",
  "s": "hancurkan bangunan"
 },
 "str-013": {
  "n": "Pengalaman Veteran",
  "d": "Prajurit tua memimpin",
  "e": "+1 untuk semua unit dalam pertempuran",
  "s": "+1 semua saat bertempur"
 },
 "str-014": {
  "n": "Barisan Diperkuat",
  "d": "Formasi pertahanan rapat",
  "e": "+3 pertahanan giliran ini",
  "s": "+3 pertahanan"
 },
 "str-016": {
  "n": "Guncangan Kavaleri",
  "d": "Pukulan pertama menentukan",
  "e": "Pertempuran pertama +3, sisanya +0",
  "s": "+3 pada serangan pertama"
 },
 "str-017": {
  "n": "Lubang Jebakan",
  "d": "Jebakan tersembunyi di medan",
  "e": "Penyerang kehilangan 1 unit sebelum pertempuran",
  "s": "+2 pertahanan"
 },
 "str-018": {
  "n": "Prajurit Bayangan",
  "d": "Pemakaian mata-mata",
  "e": "Lihat kartu di tangan musuh",
  "s": "+1 pengintaian"
 },
 "str-019": {
  "n": "Perintah Khan",
  "d": "Kepatuhan mutlak",
  "e": "Semua unit menyerang bersama",
  "s": "+3 serangan gabungan"
 },
 "str-020": {
  "n": "Kekuatan Terakhir",
  "d": "Serangan nekat",
  "e": "Serangan ganda, tetapi kehilangan setengah unit",
  "s": "+5 serangan nekat"
 },
 "str-021": {
  "n": "Penguatan Tembok",
  "d": "Perbaikan benteng",
  "e": "+2 daya tahan benteng",
  "s": "+2 benteng"
 },
 "str-022": {
  "n": "Perlawanan Terkepung",
  "d": "Jangan menyerah!",
  "e": "Pengepungan berlangsung 2 giliran lebih lama",
  "s": "+2 pertahanan selama 2 giliran"
 },
 "str-024": {
  "n": "Minyak Mendidih",
  "d": "Taktik bertahan",
  "e": "+3 pertahanan melawan pengepungan",
  "s": "+3 lawan pengepungan"
 },
 "str-025": {
  "n": "Penjaga Kota",
  "d": "Milisi warga",
  "e": "Dapatkan 2 unit infanteri sementara",
  "s": "+2 pertahanan"
 },
 "str-026": {
  "n": "Mesin Skorpion",
  "d": "Senjata kepung defensif",
  "e": "+2 pertahanan, dapat menyerang provinsi bersebelahan",
  "s": "+2 pertahanan"
 },
 "str-027": {
  "n": "Tembok Api",
  "d": "Badai api dalam pertahanan",
  "e": "Penyerang kehilangan 1 unit kavaleri",
  "s": "+2 pertahanan"
 },
 "str-028": {
  "n": "Timbunan Bekal",
  "d": "Pengepungan panjang",
  "e": "Tidak ada konsumsi makanan saat pengepungan",
  "s": "+3 makanan"
 },
 "str-032": {
  "n": "Teruji Tempur",
  "d": "Pengalaman membuahkan hasil",
  "e": "+2 pertahanan di wilayah sendiri",
  "s": "+2 di wilayah sendiri"
 },
 "str-033": {
  "n": "Tahan Dingin",
  "d": "Pertahanan musim dingin",
  "e": "Jika musim dingin: +4 pertahanan",
  "s": "+4 pertahanan musim dingin"
 },
 "str-034": {
  "n": "Penyebaran Tentara",
  "d": "Taktik gerilya",
  "e": "Bagi ke 3 provinsi, musuh memilih satu untuk diserang",
  "s": "+2 pertahanan gerilya"
 },
 "str-035": {
  "n": "Tembok Terakhir",
  "d": "Mati atau menang",
  "e": "Pertahanan x2, tetapi tidak bisa mundur",
  "s": "+5 pertahanan"
 },
 "str-051": {
  "n": "Semangat Jenghis Khan",
  "d": "Inspirasi sang penakluk agung",
  "e": "Semua unit +2 serangan dan pertahanan giliran ini",
  "s": "+2 untuk semua"
 },
 "str-054": {
  "n": "Mesiu Tiongkok",
  "d": "Teknologi baru digunakan",
  "e": "Hancurkan benteng secara otomatis",
  "s": "hancurkan benteng"
 },
 "tek-001": {
  "n": "Busur Komposit",
  "d": "Teknologi busur maju",
  "e": "+1 serangan kavaleri permanen",
  "c": "2 pengrajin",
  "s": "+1 serangan kavaleri permanen"
 },
 "tek-002": {
  "n": "Kavaleri Berat",
  "d": "Kuda berzirah",
  "e": "+1 pertahanan kavaleri permanen",
  "c": "2 pengrajin + 2 kuda",
  "s": "+1 pertahanan kavaleri permanen"
 },
 "tek-003": {
  "n": "Mesin Kepung",
  "d": "Mesin pelempar batu",
  "e": "Benteng -1 pertahanan terhadapmu",
  "c": "3 pengrajin",
  "s": "+2 lawan benteng"
 },
 "tek-005": {
  "n": "Zirah Baja",
  "d": "Zirah ditingkatkan",
  "e": "+1 pertahanan infanteri permanen",
  "c": "2 pengrajin",
  "s": "+1 pertahanan infanteri permanen"
 },
 "tek-011": {
  "n": "Sistem Pajak",
  "d": "Pemungutan pajak efisien",
  "e": "+1 emas per provinsi yang dikuasai",
  "c": "2 pengrajin",
  "s": "+5 emas"
 },
 "tek-013": {
  "n": "Teknik Bertani",
  "d": "Panen meningkat",
  "e": "+1 makanan per lahan tani",
  "c": "1 pengrajin",
  "s": "+3 makanan"
 },
 "tek-015": {
  "n": "Literasi",
  "d": "Pencatatan",
  "e": "+1 emas per giliran",
  "c": "2 pengrajin",
  "s": "+2 emas per giliran"
 },
 "tek-024": {
  "n": "Pengerjaan Logam",
  "d": "Perkakas lebih baik",
  "e": "+1 kecepatan pembangunan",
  "c": "2 pengrajin",
  "s": "+2 pengrajin"
 },
 "tek-026": {
  "n": "Arsitektur",
  "d": "Keahlian membangun",
  "e": "Benteng +1 daya tahan",
  "c": "2 pengrajin",
  "s": "+1 daya tahan benteng"
 },
 "tek-029": {
  "n": "Filsafat",
  "d": "Kekuatan pikiran",
  "e": "+1 poin kemenangan per 3 kartu teknologi",
  "c": "2 pengrajin",
  "s": "+3 emas"
 },
 "tek-030": {
  "n": "Ilmu Universal",
  "d": "Semua pengetahuan bersatu",
  "e": "Kemenangan teknologi menjadi mungkin",
  "c": "5 pengrajin + 5 emas",
  "s": "+10 emas"
 }
};

export default cards;
