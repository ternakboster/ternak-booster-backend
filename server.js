const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();

// ✅ Perbaikan CORS untuk Firebase Hosting
app.use(cors({
  origin: 'https://ternak-booster.web.app',
  credentials: true
}));

app.use(bodyParser.json());

// Route untuk Follow
app.post("/follow", async (req, res) => {
  const { cookie, ct0, username } = req.body;

  try {
    // Ambil ID user dari username
    const userRes = await fetch(`https://api.twitter.com/1.1/users/show.json?screen_name=${username}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAvq%2Fusn0wW9j%2B7YA%2FbW5VpT7k0g8%3DXXXXXXXXXXXXXXXXXXXX",
        "cookie": cookie,
        "x-csrf-token": ct0,
        "user-agent": "Mozilla/5.0"
      }
    });
    const user = await userRes.json();

    if (!user.id_str) {
      throw new Error("User tidak ditemukan atau gagal mendapat data.");
    }

    // Follow user menggunakan API Twitter
    const followRes = await fetch(`https://api.twitter.com/1.1/friendships/create.json`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAvq%2Fusn0wW9j%2B7YA%2FbW5VpT7k0g8%3DXXXXXXXXXXXXXXXXXXXX",
        "cookie": cookie,
        "x-csrf-token": ct0,
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0"
      },
      body: JSON.stringify({ user_id: user.id_str, follow: true })
    });

    if (followRes.ok) {
      const followData = await followRes.json();
      res.json({ success: true, followData });
    } else {
      throw new Error("Gagal follow user.");
    }

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Jalankan server
app.listen(3000, () => {
  console.log("🚀 Server aktif di http://localhost:3000");
});
