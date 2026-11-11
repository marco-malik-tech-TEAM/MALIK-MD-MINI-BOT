import axios from "axios";
import yts from "yt-search";
import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

const OMDB_KEYS = [process.env.OMDB_KEY, "trilogy", "thewdb", "4a3b711b"].filter(Boolean);

async function omdb(query) {
    for (const key of OMDB_KEYS) {
        try {
            const { data } = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&plot=short&apikey=${key}`, { timeout: 15000 });
            if (data?.Response === "True") return data;
            if (data?.Error && /not found/i.test(data.Error)) {
                const s = await axios.get(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${key}`, { timeout: 15000 });
                const id = s.data?.Search?.[0]?.imdbID;
                if (id) { const r = await axios.get(`https://www.omdbapi.com/?i=${id}&apikey=${key}`, { timeout: 15000 }); if (r.data?.Response === "True") return r.data; }
                return null;
            }
        } catch { /* try next key */ }
    }
    return null;
}

export const movie = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `🎬 *MOVIE INFO + TRAILER*\n\n📝 Usage: ${p}movie <name>\n📌 Example: ${p}movie Avengers Endgame\n\n${BRAND.footer}`;

    const data = await omdb(query);
    const title = data?.Title || query;
    if (data) {
        const msg = `🎬 *MOVIE INFO*\n\n📌 *Title:* ${data.Title}\n📅 *Released:* ${data.Released}\n⏱️ *Runtime:* ${data.Runtime}\n🎭 *Genre:* ${data.Genre}\n🎬 *Director:* ${data.Director}\n⭐ *Rating:* ${data.imdbRating} (${data.imdbVotes} votes)\n🏆 *Awards:* ${data.Awards}\n\n📝 *PLOT*\n${data.Plot}\n\n_Sending official trailer..._ ⏳`;
        let poster = null;
        if (data.Poster && data.Poster !== "N/A") { try { poster = Buffer.from((await axios.get(data.Poster, { responseType: "arraybuffer", timeout: 10000 })).data); } catch { } }
        await sock.sendMessage(jid, poster ? { image: poster, caption: msg } : { text: msg }, { quoted: m });
    } else {
        await sock.sendMessage(jid, { text: `⚠️ Movie details not found on IMDb for "${query}". Searching trailer... ⏳` }, { quoted: m });
    }

    try {
        const v = (await yts(`${title} official trailer`)).videos?.[0];
        if (!v) return `❌ Trailer not found.`;
        const { buffer } = await downloadMedia(v.url, { site: "youtube", kind: "video" });
        await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", caption: `🎞️ *${v.title}*\n\n${BRAND.footer}` }, { quoted: m });
    } catch (e) {
        console.error("Trailer download failed:", e.message, e.details);
        return `❌ Trailer download failed. Try again later.`;
    }
};
