export type User = {
  id: number;
  nama: string;
  angkatan: number | string;
  prodi: string;
  role: 'alumni' | 'dosen' | 'mahasiswa' | 'admin' | 'moderator';
  jabatan: string;
  keahlian: string[];
  lokasi: string;
  avatar_color: string;
  linkedin: string;
  bio: string;
  tersedia_narasumber: boolean;
  tersedia_penguji: boolean;
  tracer_filled: boolean;
};

export const USERS: User[] = [
  {
    id: 1, nama: "Dr. Rina Kusumawati", angkatan: 2005, prodi: "Teknik Pertanian",
    role: "alumni", jabatan: "Head of Supply Chain, PT Indofood Sukses Makmur",
    keahlian: ["Supply Chain Management", "Logistics Optimization", "ERP Systems"],
    lokasi: "Jakarta", avatar_color: "#c30010", linkedin: "#",
    bio: "15 tahun pengalaman di industri pangan nasional. Aktif sebagai mentor mahasiswa.",
    tersedia_narasumber: true, tersedia_penguji: true,
    tracer_filled: true,
  },
  {
    id: 2, nama: "Budi Santoso, M.T.", angkatan: 2010, prodi: "Teknologi Industri Pertanian",
    role: "alumni", jabatan: "CTO, AgriTech Startup Tanam.id",
    keahlian: ["Agro-Informatics", "IoT Agriculture", "Python", "Machine Learning"],
    lokasi: "Bandung", avatar_color: "#880000", linkedin: "#",
    bio: "Founder dan CTO startup agritech yang telah melayani 50.000+ petani.",
    tersedia_narasumber: true, tersedia_penguji: false,
    tracer_filled: false,
  },
  {
    id: 7, nama: "Rizky Pratama", angkatan: 2022, prodi: "Teknologi Pangan",
    role: "mahasiswa", jabatan: "Mahasiswa Semester 6",
    keahlian: ["Food Analysis", "Fermentation Technology"],
    lokasi: "Bogor", avatar_color: "#F9A825", linkedin: "#",
    bio: "Mahasiswa aktif yang tertarik pada bioteknologi pangan fermentasi.",
    tersedia_narasumber: false, tersedia_penguji: false,
    tracer_filled: false,
  },
  {
    id: 8, nama: "Prof. Hendra Wijaya", angkatan: 1988, prodi: "Teknik Pertanian",
    role: "dosen", jabatan: "Ketua Prodi Teknik Pertanian FTT IPB",
    keahlian: ["Precision Agriculture", "Post-Harvest Tech"],
    lokasi: "Bogor", avatar_color: "#aa0000", linkedin: "#",
    bio: "Dosen senior yang berfokus pada mekanisasi pertanian presisi.",
    tersedia_narasumber: true, tersedia_penguji: true,
    tracer_filled: true,
  },
  {
    id: 10, nama: "Moderator FTT", angkatan: "N/A", prodi: "Kemahasiswaan",
    role: "moderator", jabatan: "Staf Kemahasiswaan",
    keahlian: ["Community Management"],
    lokasi: "Bogor", avatar_color: "#440000", linkedin: "#",
    bio: "Moderator resmi forum AlumniConnect FTT IPB.",
    tersedia_narasumber: false, tersedia_penguji: false,
    tracer_filled: true,
  },
  {
    id: 9, nama: "Admin FTT", angkatan: "N/A", prodi: "Dekanat FTT",
    role: "admin", jabatan: "Staf Kemahasiswaan Fakultas",
    keahlian: ["Administration", "Student Relations"],
    lokasi: "Bogor", avatar_color: "#333333", linkedin: "#",
    bio: "Staf resmi Fakultas Teknik dan Teknologi IPB.",
    tersedia_narasumber: false, tersedia_penguji: false,
    tracer_filled: true,
  },
];

export type ThreadCategory = 'Rekrutmen' | 'Mitra Bisnis' | 'Cari Supplier' | 'Cari Customer' | 'Kolaborasi Riset' | 'Diskusi Umum';

export type Reply = {
  id: number;
  authorId: number;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: number[];
  parentId?: number; 
  isBestAnswer?: boolean;
};

export type Thread = {
  id: number;
  authorId: number;
  category: ThreadCategory;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: number[];
  replies: Reply[];
  isPinned: boolean;
  isSolved: boolean;
  views: number;
};

export const FORUM_THREADS: Thread[] = [
  {
    id: 1,
    authorId: 2,
    category: 'Rekrutmen',
    title: "Tanam.id butuh backend developer — remote, fresh grad welcome",
    content: "Halo rekan-rekan alumni dan mahasiswa tingkat akhir. Tanam.id sedang mencari 2 backend developer (Node.js/Go). Bisa remote, tapi diutamakan yang bisa sesekali ke Bandung. Fresh grad FTT sangat dipersilakan melamar!",
    timestamp: "2 jam yang lalu",
    likes: 12,
    likedBy: [7, 1],
    isPinned: false,
    isSolved: false,
    views: 156,
    replies: [
      { id: 101, authorId: 7, content: "Tertarik banget kak! Apakah butuh sertifikasi tertentu?", timestamp: "1 jam yang lalu", likes: 2, likedBy: [2] },
      { id: 102, authorId: 2, content: "Tidak wajib sertifikasi, yang penting portofolio riil.", timestamp: "45 menit yang lalu", likes: 1, likedBy: [7], parentId: 101 },
      { id: 103, authorId: 1, content: "Semoga dapet kandidat terbaik, Budi!", timestamp: "30 menit yang lalu", likes: 0, likedBy: [] }
    ]
  },
  {
    id: 2,
    authorId: 1,
    category: 'Cari Customer',
    title: "Supplier tempe premium organik siap kirim ke kantin kampus",
    content: "Kami memiliki stok tempe organik premium dengan standar ekspor. Barangkali ada rekan alumni yang mengelola kantin atau katering di sekitar IPB Dramaga, kami siap suplai rutin.",
    timestamp: "5 jam yang lalu",
    likes: 8,
    likedBy: [2, 8],
    isPinned: false,
    isSolved: true,
    views: 89,
    replies: [
      { id: 201, authorId: 8, content: "Bisa kirim sampel ke departemen? Kami sedang ada riset pangan fermentasi.", timestamp: "4 jam yang lalu", likes: 3, likedBy: [1], isBestAnswer: true },
      { id: 202, authorId: 1, content: "Siap Prof, besok saya antar.", timestamp: "3 jam yang lalu", likes: 1, likedBy: [8], parentId: 201 }
    ]
  },
  {
    id: 3,
    authorId: 1,
    category: 'Mitra Bisnis',
    title: "Cari co-founder untuk konsultan supply chain UMKM pangan",
    content: "Melihat banyaknya UMKM pangan yang kesulitan di logistik, saya berencana bikin platform konsultan. Cari mitra yang paham tech atau operasional lapangan.",
    timestamp: "1 hari yang lalu",
    likes: 21,
    likedBy: [2, 10, 7],
    isPinned: false,
    isSolved: false,
    views: 312,
    replies: [
      { id: 301, authorId: 2, content: "Wah menarik, kita bisa ngobrol via DM?", timestamp: "20 jam yang lalu", likes: 4, likedBy: [1] }
    ]
  },
  {
    id: 4,
    authorId: 7,
    category: 'Diskusi Umum',
    title: "Pengalaman magang startup vs korporat besar — worth mana?",
    content: "Halo kakak-kakak alumni. Sebagai mahasiswa semester 6, saya bingung mending magang di startup agritech atau korporat FMCG besar ya? Mohon sarannya.",
    timestamp: "3 jam yang lalu",
    likes: 34,
    likedBy: [1, 2, 8, 10],
    isPinned: true,
    isSolved: false,
    views: 540,
    replies: [
      { id: 401, authorId: 1, content: "Di korporat dapet sistemnya, di startup dapet agility-nya. Keduanya bagus buat CV.", timestamp: "2 jam yang lalu", likes: 15, likedBy: [7, 2] },
      { id: 402, authorId: 2, content: "Setuju sama Mbak Rina. Kalo mau belajar banyak hal dalam waktu singkat, startup tempatnya.", timestamp: "1 jam yang lalu", likes: 10, likedBy: [7, 1] }
    ]
  },
  {
    id: 5,
    authorId: 8,
    category: 'Kolaborasi Riset',
    title: "Dataset sensori 10.000 responden terbuka untuk riset akademik",
    content: "Kami memiliki dataset hasil uji sensori produk olahan umbi-umbian. Bagi alumni yang sedang lanjut studi atau praktisi R&D yang butuh data pembanding, silakan digunakan.",
    timestamp: "2 hari yang lalu",
    likes: 19,
    likedBy: [1, 10],
    isPinned: false,
    isSolved: false,
    views: 210,
    replies: [
      { id: 501, authorId: 1, content: "Ini sangat membantu departemen R&D kami, Prof. Terima kasih sharing-nya.", timestamp: "1 hari yang lalu", likes: 5, likedBy: [8] }
    ]
  }
];

export type Message = {
  id: number;
  fromId: number;
  toId: number;
  content: string;
  timestamp: string;
  isRead: boolean;
};

export type Report = {
  id: number;
  reporterId: number;
  targetId: number;
  targetType: 'thread' | 'reply';
  reason: string;
  note?: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'ignored';
};

export type JobStatus = 'Aktif' | 'Menunggu Review' | 'Ditolak' | 'Ditutup';
export type ApplyMethod = 'Portal' | 'Eksternal' | 'Keduanya';

export type JobListing = {
  id: number;
  posted_by: number;
  judul: string;
  perusahaan: string;
  lokasi: string;
  tipe: 'Full-time' | 'Magang' | 'Freelance';
  bidang: string;
  deadline: string;
  deskripsi: string;
  syarat: string[];
  gaji: string;
  views: number;
  applicants: number;
  status: JobStatus;
  metode_lamaran: ApplyMethod;
  link_eksternal?: string;
  email_lamaran?: string;
  rejection_reason?: string;
};

export const JOBS: JobListing[] = [
  {
    id: 1, posted_by: 1, judul: "Supply Chain Analyst",
    perusahaan: "PT Indofood Sukses Makmur", lokasi: "Jakarta Selatan",
    tipe: "Full-time", bidang: "Supply Chain", deadline: "2026-05-31",
    deskripsi: "Mengelola data inventory, koordinasi dengan vendor, dan analisis KPI logistik untuk divisi mi instan.",
    syarat: ["S1 Teknik Pertanian / TIN", "IPK min. 3.2", "Familiar Excel & SAP", "Kemampuan analisis data kuat"],
    gaji: "Rp 7–9 juta", views: 245, applicants: 12, status: 'Aktif',
    metode_lamaran: 'Portal', email_lamaran: 'hrd@indofood.com'
  },
  {
    id: 2, posted_by: 2, judul: "IoT Agriculture Engineer",
    perusahaan: "Tanam.id", lokasi: "Bandung / Remote",
    tipe: "Magang", bidang: "Agro-Informatics", deadline: "2026-05-15",
    deskripsi: "Mengembangkan sensor IoT untuk monitoring lahan pertanian mitra di Jawa Barat.",
    syarat: ["Mahasiswa semester 6-8 TIN/Tekpan", "Bisa Python/C++", "Tertarik bidang smart farming"],
    gaji: "Rp 2–3 juta", views: 189, applicants: 24, status: 'Aktif',
    metode_lamaran: 'Eksternal', link_eksternal: 'https://tanam.id/careers'
  },
  {
    id: 3, posted_by: 1, judul: "Junior Warehouse Supervisor",
    perusahaan: "PT Indofood Sukses Makmur", lokasi: "Cibitung",
    tipe: "Full-time", bidang: "Logistik", deadline: "2026-06-05",
    deskripsi: "Mengawasi operasional harian gudang bahan baku dan memastikan akurasi stok.",
    syarat: ["Lulusan baru Teknik Pertanian", "Bersedia kerja shift", "Leadership yang kuat"],
    gaji: "Rp 6–8 juta", views: 45, applicants: 0, status: 'Menunggu Review',
    metode_lamaran: 'Keduanya', email_lamaran: 'hrd@indofood.com', link_eksternal: 'https://indofood.com/career'
  },
  {
    id: 4, posted_by: 3, judul: "Quality Control Assistant",
    perusahaan: "PT Garudafood", lokasi: "Pati",
    tipe: "Full-time", bidang: "Food Tech", deadline: "2026-04-01",
    deskripsi: "Memastikan kualitas produk akhir sesuai dengan standar keamanan pangan nasional.",
    syarat: ["S1 Teknologi Pangan", "Paham HACCP & ISO 22000", "Teliti"],
    gaji: "Rp 5–7 juta", views: 567, applicants: 89, status: 'Ditutup',
    metode_lamaran: 'Portal'
  }
];

export const NEWS = [
  {
    id: 1, judul: "Alumni FTT IPB Raih Penghargaan Innovator of the Year 2025",
    tanggal: "2026-04-10", kategori: "Prestasi",
    penulis: "Admin Humas FTT", featured: true,
    ringkasan: "Budi Santoso (TIN 2010), pendiri Tanam.id, dinobatkan sebagai Innovator of the Year oleh Kementerian Pertanian RI atas inovasinya di bidang smart farming berbasis IoT.",
    tag: ["Prestasi", "AgriTech", "IoT"],
  },
  {
    id: 2, judul: "FTT IPB Launching Portal Alumni Digital",
    tanggal: "2026-04-15", kategori: "Pengumuman",
    penulis: "Admin FTT IPB", featured: true,
    ringkasan: "Fakultas Teknik dan Teknologi IPB resmi meluncurkan Portal Alumni Digital sebagai infrastruktur kolaborasi antara alumni, mahasiswa, dan dosen.",
    tag: ["Pengumuman", "Portal", "Inovasi"],
  },
  {
    id: 3, judul: "Kiprah Alumni: Menembus Pasar Ekspor dengan Inovasi Pasca Panen",
    tanggal: "2026-04-18", kategori: "Kiprah",
    penulis: "Dian Safitri", featured: false,
    ringkasan: "Sejumlah alumni FTT angkatan 2012 berhasil membangun rantai pasok buah eksotis dari petani lokal hingga menembus pasar Eropa menggunakan teknologi pendingin hemat energi.",
    tag: ["Kiprah", "Ekspor", "Riset"],
  },
  {
    id: 4, judul: "Wirausaha Muda: Kisah Sukses Kedai Kopi Berbasis Smart-Roasting",
    tanggal: "2026-04-20", kategori: "Wirausaha",
    penulis: "Tim Media Alumni", featured: true,
    ringkasan: "Rian Ardiansyah memanfaatkan ilmu teknik pertaniannya untuk menciptakan mesin roasting kopi otomatis yang kini telah digunakan oleh puluhan UMKM kopi di seluruh Indonesia.",
    tag: ["Wirausaha", "Agribisnis", "Inovasi"],
  },
  {
    id: 5, judul: "Pendaftaran Reuni Akbar FTT IPB 2026 Telah Dibuka",
    tanggal: "2026-04-22", kategori: "Pengumuman",
    penulis: "Panitia Reuni", featured: false,
    ringkasan: "Bersiaplah untuk kembali ke rumah! Reuni akbar tahun ini akan mengusung tema 'Sinergi Teknik Pertanian untuk Kedaulatan Pangan Masa Depan'.",
    tag: ["Pengumuman", "Event", "Silaturahmi"],
  },
  {
    id: 6, judul: "Tim Mahasiswa FTT Juara 1 Kompetisi Robotika Pertanian Dunia",
    tanggal: "2026-04-25", kategori: "Prestasi",
    penulis: "Dekanat FTT", featured: false,
    ringkasan: "Bangga! Tim mahasiswa angkatan 2022 berhasil menyisihkan 50 universitas dunia dalam menciptakan robot pemanen padi otomatis yang sangat efisien.",
    tag: ["Prestasi", "Robotika", "Mahasiswa"],
  }
];

// RESEARCH TYPES
export type ResearchStatus = 'Open' | 'In Progress' | 'Completed';
export type ResearchCategory = 'Logistik & Supply Chain' | 'Agro-Informatics' | 'Bioteknologi Pangan' | 'Teknologi Pangan' | 'Teknik Lingkungan';
export type ResearchOutput = 'Skripsi' | 'Tesis' | 'Paper Jurnal' | 'Prototipe' | 'Laporan';

export type ResearchProposal = {
  id: number;
  studentId: number;
  judul: string;
  pendekatan: string;
  relevansi: string;
  timestamp: string;
};

export type ResearchThread = {
  id: number;
  postedBy: number;
  status: ResearchStatus;
  category: ResearchCategory;
  title: string;
  description: string;
  needs: string;
  dataAvailable: boolean;
  dataType?: string;
  fieldVisitAvailable: boolean;
  outputs: ResearchOutput[];
  duration: string;
  academicSupervisorId?: number;
  pendingAcademicSupervisorIds: number[];
  proposals: ResearchProposal[];
  matchedStudentId?: number;
  outcome?: string;
  replies: Reply[];
};

export const RESEARCH_THREADS: ResearchThread[] = [
  {
    id: 1,
    postedBy: 1,
    status: 'Open',
    category: 'Logistik & Supply Chain',
    title: "Optimasi Rute Distribusi Multi-Depot untuk Produk Segar",
    description: "PT Indofood memiliki kendala dalam menjaga kesegaran produk selama distribusi dari 3 depot utama di Jawa Barat. Dibutuhkan model optimasi rute yang mempertimbangkan jendela waktu (time window) dan degradasi kualitas produk.",
    needs: "Pengembangan algoritma metaheuristik untuk minimasi biaya bahan bakar dan maksimalisasi tingkat kesegaran produk saat sampai di outlet.",
    dataAvailable: true,
    dataType: "Data histori pengiriman 6 bulan terakhir, koordinat 1.200 outlet.",
    fieldVisitAvailable: true,
    outputs: ['Skripsi', 'Paper Jurnal'],
    duration: "4–6 bln",
    pendingAcademicSupervisorIds: [8],
    proposals: [
      { id: 1001, studentId: 7, judul: "Implementasi Ant Colony Optimization untuk Rute Indofood", pendekatan: "Menggunakan algoritma ACO dengan fungsi penalti waktu.", relevansi: "Sesuai dengan konsentrasi Logistik di semester 6.", timestamp: "1 hari yang lalu" }
    ],
    replies: []
  },
  {
    id: 2,
    postedBy: 2,
    status: 'In Progress',
    category: 'Agro-Informatics',
    title: "Prediksi Serangan Hama Padi Berbasis Data Sensor IoT",
    description: "Tanam.id memiliki 50 titik sensor IoT di Karawang. Kami ingin membangun model early warning system untuk ledakan populasi wereng berbasis suhu dan kelembapan tanah.",
    needs: "Data scientist junior yang bisa mengolah time-series data dan membangun model klasifikasi.",
    dataAvailable: true,
    dataType: "Dataset sensor 1 tahun (CSV/SQL).",
    fieldVisitAvailable: false,
    outputs: ['Tesis', 'Prototipe'],
    duration: "6 bln",
    academicSupervisorId: 8,
    pendingAcademicSupervisorIds: [],
    matchedStudentId: 7,
    proposals: [
      { id: 1002, studentId: 7, judul: "LSTM untuk Prediksi Wereng", pendekatan: "RNN LSTM dengan dataset IoT.", relevansi: "Tugas akhir tingkat lanjut.", timestamp: "3 hari yang lalu" }
    ],
    replies: []
  },
  {
    id: 3,
    postedBy: 1,
    status: 'Open',
    category: 'Bioteknologi Pangan',
    title: "Formulasi Tempe Rendah Purin untuk Penderita Asam Urat",
    description: "Permintaan konsumen akan alternatif protein rendah purin meningkat. Kami mencari mahasiswa yang tertarik meneliti pengaruh jenis kapang dan durasi fermentasi terhadap kadar purin pada tempe.",
    needs: "Eksperimen laboratorium dengan berbagai variabel fermentasi.",
    dataAvailable: false,
    fieldVisitAvailable: true,
    outputs: ['Skripsi'],
    duration: "8–12 bln",
    pendingAcademicSupervisorIds: [],
    proposals: [],
    replies: []
  },
  {
    id: 4,
    postedBy: 2,
    status: 'Completed',
    category: 'Teknologi Pangan',
    title: "Teknologi Pengemasan Aktif — Shelf Life Snack",
    description: "Evaluasi efektivitas kemasan aktif berbasis rosemary extract untuk memperpanjang masa simpan snack ekstrusi.",
    needs: "Studi literatur dan pengujian organoleptik masa simpan.",
    dataAvailable: true,
    dataType: "Hasil lab internal awal.",
    fieldVisitAvailable: false,
    outputs: ['Laporan'],
    duration: "4–6 bln",
    academicSupervisorId: 8,
    outcome: "Kemasan aktif rosemary memperpanjang shelf life dari 3 bulan menjadi 7 bulan. Dipublikasikan di Jurnal Teknologi Pangan.",
    proposals: [],
    replies: []
  }
];