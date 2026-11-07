// Data vila (tanpa basis data, semua ada di array objek ini)
const dataVila = [
  { id: 1, nama: "Vila Melati", tipe: "2 kamar tidur", lokasi: "Cipanas, Puncak", harga: 650000, kapasitas: 5, fasilitas: ["Dapur", "Wi-Fi", "Pemanas air"], tersedia: true, terisi: [] },
  { id: 2, nama: "Vila Cemara", tipe: "3 kamar tidur", lokasi: "Cisarua, Puncak", harga: 950000, kapasitas: 8, fasilitas: ["Kolam renang", "Dapur", "Area barbeku"], tersedia: true, terisi: [["2026-12-24", "2026-12-27"]] },
  { id: 3, nama: "Vila Anggrek", tipe: "4 kamar tidur", lokasi: "Megamendung, Puncak", harga: 1350000, kapasitas: 10, fasilitas: ["Kolam renang", "Karaoke", "Taman luas"], tersedia: false, terisi: [["2026-11-01", "2026-12-31"]] }
];

const KUNCI_NAMA = "vilaPermai.namaTerakhir";
const KUNCI_PESANAN = "vilaPermai.daftarPesanan";

const el = {
  grid: document.querySelector(".villa-grid"),
  cari: document.querySelector(".search__input"),
  kosong: document.querySelector(".message--info"),
  form: document.querySelector(".booking-form"),
  nama: document.querySelector("[name=nama]"),
  vila: document.querySelector("[name=vila]"),
  checkin: document.querySelector("[name=checkin]"),
  checkout: document.querySelector("[name=checkout]"),
  tamu: document.querySelector("[name=tamu]"),
  error: document.querySelector(".booking-form__error"),
  tombolCek: document.querySelector(".button--secondary"),
  ringkasan: document.querySelector(".summary"),
  teksRingkasan: document.querySelector(".summary__text"),
  daftarPesanan: document.querySelector(".order-list"),
  pesananKosong: document.querySelectorAll(".summary__text")[1]
};

function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

function hariIni() {
  const t = new Date();
  const bulan = String(t.getMonth() + 1).padStart(2, "0");
  const hari = String(t.getDate()).padStart(2, "0");
  return t.getFullYear() + "-" + bulan + "-" + hari;
}

function hitungMalam(masuk, keluar) {
  const selisih = new Date(keluar) - new Date(masuk);
  return Math.round(selisih / (1000 * 60 * 60 * 24));
}

function cariVilaById(id) {
  return dataVila.find(function (v) { return v.id === Number(id); });
}

// Faktor kamar: tamu melebihi 2 orang dikenai biaya tambahan 10% per tamu
function hitungTotalHarga(vila, malam, tamu) {
  const faktorTamu = 1 + Math.max(0, tamu - 2) * 0.1;
  return vila.harga * malam * faktorTamu;
}

function bentrokJadwal(vila, masuk, keluar) {
  return vila.terisi.some(function (rentang) {
    return masuk < rentang[1] && keluar > rentang[0];
  });
}

function validasiForm() {
  const nama = el.nama.value.trim();
  const vila = cariVilaById(el.vila.value);
  const tamu = Number(el.tamu.value);

  if (nama === "") return "Nama tamu wajib diisi.";
  if (!el.checkin.value) return "Tanggal check-in wajib diisi.";
  if (!el.checkout.value) return "Tanggal check-out wajib diisi.";
  if (el.checkin.value < hariIni()) return "Tanggal check-in tidak boleh di masa lalu.";
  if (el.checkout.value <= el.checkin.value) return "Tanggal check-out harus setelah tanggal check-in.";
  if (!Number.isInteger(tamu) || tamu < 1 || tamu > 10) return "Jumlah tamu harus antara 1 sampai 10 orang.";
  if (!vila) return "Silakan pilih salah satu vila.";
  if (tamu > vila.kapasitas) return vila.nama + " hanya muat " + vila.kapasitas + " tamu. Kurangi jumlah tamu atau pilih vila lain.";
  if (!vila.tersedia) return vila.nama + " sedang penuh. Silakan pilih vila lain.";
  if (bentrokJadwal(vila, el.checkin.value, el.checkout.value)) return vila.nama + " sudah terisi pada tanggal tersebut. Pilih tanggal lain.";
  return "";
}

function tampilkanError(pesan) {
  el.error.textContent = pesan;
  el.error.hidden = pesan === "";
}

function perbaruiRingkasan() {
  const vila = cariVilaById(el.vila.value);
  const tamu = Number(el.tamu.value);
  if (!vila || !el.checkin.value || !el.checkout.value || el.checkout.value <= el.checkin.value || !(tamu >= 1)) {
    el.teksRingkasan.textContent = "Isi tanggal, jumlah tamu, dan pilih vila. Total biaya akan muncul di sini.";
    return;
  }
  const malam = hitungMalam(el.checkin.value, el.checkout.value);
  const total = hitungTotalHarga(vila, malam, tamu);
  el.teksRingkasan.textContent = vila.nama + ": " + formatRupiah(vila.harga) + " x " + malam + " malam untuk " + tamu + " tamu = " + formatRupiah(total);
  el.ringkasan.classList.remove("summary--updated");
  void el.ringkasan.offsetWidth; // memicu ulang animasi
  el.ringkasan.classList.add("summary--updated");
}

// Render kartu vila memakai createElement dan appendChild
function buatKartuVila(vila) {
  const kartu = document.createElement("article");
  kartu.className = "villa-card";

  const nama = document.createElement("h3");
  nama.className = "villa-card__name";
  nama.textContent = vila.nama;

  const meta = document.createElement("p");
  meta.className = "villa-card__meta";
  meta.textContent = vila.tipe + " | " + vila.lokasi + " | maks. " + vila.kapasitas + " tamu";

  const harga = document.createElement("p");
  harga.className = "villa-card__price";
  harga.textContent = formatRupiah(vila.harga) + " / malam";

  const daftar = document.createElement("ul");
  daftar.className = "villa-card__facilities";
  vila.fasilitas.forEach(function (f) {
    const li = document.createElement("li");
    li.textContent = f;
    daftar.appendChild(li);
  });

  const status = document.createElement("span");
  status.className = "villa-card__status " + (vila.tersedia ? "villa-card__status--ready" : "villa-card__status--full");
  status.textContent = vila.tersedia ? "Tersedia" : "Penuh";

  [nama, meta, harga, daftar, status].forEach(function (n) { kartu.appendChild(n); });
  return kartu;
}

function renderDaftarVila(kataKunci) {
  const kunci = (kataKunci || "").toLowerCase().trim();
  el.grid.textContent = "";
  const hasil = dataVila.filter(function (v) {
    const teks = (v.nama + " " + v.lokasi + " " + v.tipe + " " + v.fasilitas.join(" ")).toLowerCase();
    return teks.includes(kunci);
  });
  hasil.forEach(function (v) { el.grid.appendChild(buatKartuVila(v)); });
  el.kosong.hidden = hasil.length > 0;
}

function isiPilihanVila() {
  dataVila.forEach(function (v) {
    const opsi = document.createElement("option");
    opsi.value = v.id;
    opsi.textContent = v.nama + " - " + formatRupiah(v.harga) + "/malam";
    el.vila.appendChild(opsi);
  });
}

// Penyimpanan lokal dengan penanganan error
function bacaPesanan() {
  try {
    const mentah = localStorage.getItem(KUNCI_PESANAN);
    return mentah ? JSON.parse(mentah) : [];
  } catch (e) {
    return [];
  }
}

function simpanData(pesananBaru) {
  try {
    localStorage.setItem(KUNCI_NAMA, pesananBaru.nama);
    const semua = bacaPesanan();
    semua.push(pesananBaru);
    localStorage.setItem(KUNCI_PESANAN, JSON.stringify(semua));
    return true;
  } catch (e) {
    tampilkanError("Data tidak dapat disimpan di peramban ini. Pesanan Anda tetap tercatat di halaman, tetapi akan hilang saat halaman ditutup.");
    return false;
  }
}

function renderDaftarPesanan(daftar) {
  el.daftarPesanan.textContent = "";
  daftar.forEach(function (p) {
    const li = document.createElement("li");
    li.className = "order-list__item";
    li.textContent = p.nama + " | " + p.vila + " | " + p.checkin + " s.d. " + p.checkout + " | " + p.tamu + " tamu | " + formatRupiah(p.total);
    el.daftarPesanan.appendChild(li);
  });
  el.pesananKosong.hidden = daftar.length > 0;
}

function saatCekKetersediaan() {
  const pesan = validasiForm();
  tampilkanError(pesan);
  if (pesan === "") {
    perbaruiRingkasan();
    el.teksRingkasan.textContent += ". Vila tersedia di tanggal tersebut.";
  }
}

function saatKirimForm(event) {
  event.preventDefault();
  const pesan = validasiForm();
  tampilkanError(pesan);
  if (pesan !== "") return;

  const vila = cariVilaById(el.vila.value);
  const malam = hitungMalam(el.checkin.value, el.checkout.value);
  const pesanan = {
    nama: el.nama.value.trim(),
    vila: vila.nama,
    checkin: el.checkin.value,
    checkout: el.checkout.value,
    tamu: Number(el.tamu.value),
    total: hitungTotalHarga(vila, malam, Number(el.tamu.value))
  };
  simpanData(pesanan);
  renderDaftarPesanan(bacaPesanan());
  el.teksRingkasan.textContent = "Pesanan atas nama " + pesanan.nama + " berhasil dikirim. Total " + formatRupiah(pesanan.total) + ". Pak Hendra akan menghubungi Anda.";
}

function mulai() {
  isiPilihanVila();
  renderDaftarVila("");
  el.checkin.min = hariIni();
  el.checkout.min = hariIni();
  try {
    el.nama.value = localStorage.getItem(KUNCI_NAMA) || "";
  } catch (e) {
    el.nama.value = "";
  }
  renderDaftarPesanan(bacaPesanan());

  el.cari.addEventListener("input", function () { renderDaftarVila(el.cari.value); });
  [el.vila, el.checkin, el.checkout, el.tamu].forEach(function (i) {
    i.addEventListener("input", perbaruiRingkasan);
  });
  el.tombolCek.addEventListener("click", saatCekKetersediaan);
  el.form.addEventListener("submit", saatKirimForm);
}

mulai();

// Logika interaksi form dan pencarian vila