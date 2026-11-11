import yts from "yt-search";
import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, firstUrl, detectSite } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

export const play = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `🎵 *MUSIC / MP3 DOWNLOADER*\n\n📝 Usage: ${p}play <song name or YouTube link>\n📌 Example: ${p}play Light Jesus\n\n${BRAND.footer}`;

    try {
        const link = firstUrl(query);
        let video;
        if (link && detectSite(link) === "youtube") {
            const id = (link.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
            video = id ? await yts({ videoId: id }) : null;
            if (video) video.url = link;
        }
        if (!video) video = (await yts(query)).videos?.[0];
        if (!video) return `❌ Song not found. Try a different name.`;

        const info = `🎵 *PLAYING MUSIC*\n\n📌 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp || video.duration?.timestamp || "-"}\n👀 *Views:* ${video.views}\n🔗 *Link:* ${video.url}\n\n_Downloading audio... please wait_ ⏳`;
        let thumb;
        try { thumb = Buffer.from((await axios.get(video.thumbnail || video.image, { responseType: "arraybuffer", timeout: 8000 })).data); } catch { }
        await sock.sendMessage(jid, thumb ? { image: thumb, caption: info } : { text: info }, { quoted: m });

        try {
            const { buffer } = await downloadMedia(video.url, { site: "youtube", kind: "audio" });
            await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg", fileName: `${video.title}.mp3` }, { quoted: m });
        } catch (e) {
            console.error("Audio download failed:", e.message, e.details);
            await sock.sendMessage(jid, { text: `❌ *Audio download failed.*\n\n💡 All servers are busy or YouTube blocked this server.\nAdmin tip: set YT_COOKIES env (see README).\n\n🔗 ${video.url}` }, { quoted: m });
        }
    } catch (err) {
        console.error("Play error:", err.message);
        return `❌ Failed to process music request.`;
    }
};
