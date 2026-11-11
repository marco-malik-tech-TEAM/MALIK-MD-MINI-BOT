import yts from "yt-search";
import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, firstUrl, detectSite } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

export const video = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `📹 *VIDEO DOWNLOADER*\n\n📝 Usage: ${p}video <name or any video link>\n📌 Example: ${p}video funny cats\n📌 Works with YouTube, TikTok, Instagram, Facebook links\n\n${BRAND.footer}`;

    try {
        const link = firstUrl(query);
        let url = link, title = "Video", site = link ? detectSite(link) : "youtube";
        if (!link || site === "youtube") {
            let v;
            if (link) {
                const id = (link.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
                v = id ? await yts({ videoId: id }) : null;
                if (v) v.url = link;
            }
            if (!v) v = (await yts(query)).videos?.[0];
            if (!v) return `❌ Video not found. Try a different name.`;
            url = v.url; title = v.title;
            const info = `📹 *VIDEO DOWNLOAD*\n\n📌 *Title:* ${v.title}\n⏱️ *Duration:* ${v.timestamp || v.duration?.timestamp || "-"}\n👀 *Views:* ${v.views}\n🔗 *Link:* ${v.url}\n\n_Downloading video... please wait_ ⏳`;
            let thumb;
            try { thumb = Buffer.from((await axios.get(v.thumbnail || v.image, { responseType: "arraybuffer", timeout: 8000 })).data); } catch { }
            await sock.sendMessage(jid, thumb ? { image: thumb, caption: info } : { text: info }, { quoted: m });
        } else {
            await sock.sendMessage(jid, { text: `📹 Downloading from *${site}*... ⏳` }, { quoted: m });
        }

        try {
            const { buffer } = await downloadMedia(url, { site, kind: "video" });
            await sock.sendMessage(jid, { video: buffer, caption: `🎬 ${title}\n\n${BRAND.footer}`, mimetype: "video/mp4" }, { quoted: m });
        } catch (e) {
            console.error("Video download failed:", e.message, e.details);
            await sock.sendMessage(jid, { text: `❌ *Video download failed.*\n\n💡 Servers busy / link blocked. Try again later.\n🔗 ${url}` }, { quoted: m });
        }
    } catch (err) {
        console.error("Video error:", err.message);
        return `❌ Failed to process video request.`;
    }
};
