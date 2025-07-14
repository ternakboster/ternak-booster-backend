document.addEventListener('DOMContentLoaded', function () {
  console.log("🔥 admin.js loaded");
  console.log("🔥 db is", window.db);
  console.log("✅ Firebase DB connected:", !!window.db);

  const form = document.getElementById('akunForm');
  const platformInput = document.getElementById('platform');
  const cookieInput = document.getElementById('cookie');
  const statusMsg = document.getElementById('statusMsg');
  const akunList = document.getElementById('akunList');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const platform = platformInput.value;
    const cookie = cookieInput.value;

    if (platform && cookie) {
      const akunRef = window.db.ref('akun/' + platform).push();
      akunRef.set({
        cookie: cookie,
        waktu: new Date().toISOString()
      })
      .then(() => {
        statusMsg.innerText = "✅ Akun berhasil disimpan!";
        form.reset();
        loadAkun();
      })
      .catch((error) => {
        statusMsg.innerText = "❌ Gagal menyimpan: " + error.message;
      });
    } else {
      statusMsg.innerText = "⚠️ Lengkapi semua kolom!";
    }
  });

  function loadAkun() {
    akunList.innerHTML = "<p>🔄 Memuat data...</p>";
    window.db.ref("akun").once("value", (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        akunList.innerHTML = "<p>❌ Belum ada akun tersimpan.</p>";
        return;
      }

      let html = "";
      for (const platform in data) {
        html += `<h3 style="color:#0f0">${platform.toUpperCase()}</h3><ul>`;
        for (const id in data[platform]) {
          const akun = data[platform][id];
          html += `
            <li style="margin-bottom:10px; background:#111; padding:10px; border-left:3px solid #0f0; border-radius:5px">
              <code style="word-break:break-all; font-size: 0.9em">${akun.cookie}</code><br>
              <small>${new Date(akun.waktu).toLocaleString()}</small><br>
              <button onclick="hapusAkun('${platform}', '${id}')">🗑️ Hapus</button>
            </li>
          `;
        }
        html += `</ul><hr>`;
      }
      akunList.innerHTML = html;
    });
  }

  window.loadAkun = loadAkun;

  window.hapusAkun = function(platform, id) {
    if (confirm("Yakin ingin menghapus akun ini?")) {
      window.db.ref(`akun/${platform}/${id}`).remove()
        .then(() => {
          alert("✅ Akun dihapus!");
          loadAkun();
        })
        .catch((err) => alert("❌ Gagal hapus: " + err.message));
    }
  }

  window.exportJSON = function () {
    window.db.ref("akun").once("value", (snapshot) => {
      const data = snapshot.val();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "akun-tumbal.json";
      a.click();
    });
  }

  window.exportTXT = function () {
    window.db.ref("akun").once("value", (snapshot) => {
      const data = snapshot.val();
      let output = "";
      for (const platform in data) {
        for (const id in data[platform]) {
          output += `${data[platform][id].cookie}\n`;
        }
      }
      const blob = new Blob([output], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "akun-tumbal.txt";
      a.click();
    });
  }

  window.importFile = function () {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        for (const platform in importedData) {
          for (const key in importedData[platform]) {
            const data = importedData[platform][key];
            window.db.ref("akun/" + platform).push({
              cookie: data.cookie,
              waktu: data.waktu || new Date().toISOString()
            });
          }
        }
        alert("✅ Data berhasil diimport!");
        loadAkun();
      } catch (err) {
        alert("❌ Gagal membaca file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  loadAkun();
});
