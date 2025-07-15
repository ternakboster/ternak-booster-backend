const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cookie, ct0, username } = req.body;

  try {
    const userRes = await fetch(`https://api.twitter.com/1.1/users/show.json?screen_name=${username}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAvq%2Fusn0wW9j%2B7YA%2FbW5VpT7k0g8%3DXXXXXXXXXXXXXX",
        "cookie": cookie,
        "x-csrf-token": ct0,
        "user-agent": "Mozilla/5.0"
      }
    });

    const user = await userRes.json();
    if (!user.id_str) throw new Error("User tidak ditemukan");

    const followRes = await fetch(`https://api.twitter.com/1.1/friendships/create.json`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAvq%2Fusn0wW9j%2B7YA%2FbW5VpT7k0g8%3DXXXXXXXXXXXXXX",
        "cookie": cookie,
        "x-csrf-token": ct0,
        "content-type": "application/json",
        "user-agent": "Mozilla/5.0"
      },
      body: JSON.stringify({ user_id: user.id_str, follow: true })
    });

    if (!followRes.ok) throw new Error("Gagal follow user");

    const followData = await followRes.json();
    return res.json({ success: true, followData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
