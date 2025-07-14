function log(msg) {
  document.getElementById("logBox").textContent += msg + "\n";
}

// Deteksi apakah sedang dijalankan di localhost atau hosting
const BASE_URL = location.hostname === "localhost" || location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://ternak-booster.web.app"; // ganti jika kamu deploy server di tempat lain

async function startFollow() {
  const username = document.getElementById("targetUsername").value.trim();
  if (!username) return alert("Masukkan username target.");

  log("📥 Mengambil akun tumbal dari Firebase...");

  const snapshot = await window.db.ref("akun/x").once("value");
  const akunList = snapshot.val();
  if (!akunList) return log("❌ Tidak ada akun tumbal X.com.");

  for (const id in akunList) {
    const akun = akunList[id];
    const cookie = akun.cookie;

    log(`👉 Menjalankan akun ID: ${id}`);

    try {
      const response = await fetch(`${BASE_URL}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cookie, target: username })
      });

      const result = await response.json();
      if (result.success) {
        log(`✅ Berhasil follow dengan akun ${id}`);
      } else {
        log(`❌ Gagal follow akun ${id}: ${result.message}`);
      }
    } catch (err) {
      log(`❌ Error: ${err.message}`);
    }
  }

  log("✅ Selesai semua akun.");
}
