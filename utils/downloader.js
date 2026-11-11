import axios from "axios";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { randomBytes } from "crypto";

const UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const MAX_BYTES = 95 * 1024 * 1024; // WhatsApp practical limit

/** Download a direct media URL into a Buffer and validate it is really media (not an HTML error page). */
export async function fetchBuffer(url, minBytes = 10 * 1024) {
    const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: MAX_BYTES,
        maxBodyLength: MAX_BYTES,
        headers: { "User-Agent": UA, Accept: "*/*" },
        maxRedirects: 5
    });
    const type = String(res.headers["content-type"] || "").toLowerCase();
    const buf = Buffer.from(res.data);
    if (type.includes("text/html") || type.includes("application/json") || buf.length < minBytes) {
        throw new Error(`Invalid media (type=${type || "?"}, size=${buf.length}B)`);
    }
    return buf;
}

/** Run yt-dlp (works for YouTube, TikTok, Instagram, Facebook, Twitter...) */
export function ytdlp(url, kind = "video") {
    return new Promise((resolve, reject) => {
        const id = randomBytes(6).toString("hex");
        const base = path.join(os.tmpdir(), `dl_${id}`);
        const out = `${base}.%(ext)s`;
        const common = [
            "--no-playlist", "--no-warnings", "--geo-bypass", "--force-ipv4",
            "--socket-timeout", "30", "--retries", "3",
            "--extractor-args", "youtube:player_client=tv,ios,web_safari,android",
            "--user-agent", UA,
            "-o", out
        ];
        // Optional cookies (fixes "Sign in to confirm you're not a bot"): set YT_COOKIES env = path or raw cookies.txt content
        let cookieFile = null;
        if (process.env.YT_COOKIES) {
            try {
                const v = process.env.YT_COOKIES;
                if (fs.existsSync(v)) cookieFile = v;
                else { cookieFile = `${base}.cookies.txt`; fs.writeFileSync(cookieFile, v); }
                common.push("--cookies", cookieFile);
            } catch { /* ignore */ }
        }
        const fmt = kind === "audio"
            ? ["-f", "bestaudio[ext=m4a]/bestaudio/best", "-x", "--audio-format", "mp3", "--audio-quality", "5"]
            : ["-f", "best[ext=mp4][filesize<90M]/best[ext=mp4]/bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best", "--merge-output-format", "mp4"];

        const bins = [path.resolve("./bin/yt-dlp"), "yt-dlp"];
        const tryBin = (i) => {
            if (i >= bins.length) return reject(new Error("yt-dlp not available"));
            let err = "";
            let child;
            try { child = spawn(bins[i], [...fmt, ...common, url]); } catch (e) { return tryBin(i + 1); }
            child.on("error", () => tryBin(i + 1));
            child.stderr.on("data", d => { err += d.toString(); });
            child.on("close", (code) => {
                const dir = os.tmpdir();
                const file = fs.readdirSync(dir).find(f => f.startsWith(`dl_${id}.`) && !f.endsWith(".txt") && !f.endsWith(".part"));
                if (code === 0 && file) {
                    const full = path.join(dir, file);
                    try {
                        const buf = fs.readFileSync(full);
                        fs.unlinkSync(full);
                        if (cookieFile && cookieFile.startsWith(base)) fs.unlinkSync(cookieFile);
                        return resolve(buf);
                    } catch (e) { return reject(e); }
                }
                fs.readdirSync(dir).filter(f => f.startsWith(`dl_${id}`)).forEach(f => { try { fs.unlinkSync(path.join(dir, f)); } catch { } });
                reject(new Error(`yt-dlp: ${(err.split("\n").filter(Boolean).pop() || "failed").slice(0, 200)}`));
            });
        };
        tryBin(0);
    });
}

const first = (...v) => v.find(x => typeof x === "string" && x.startsWith("http"));
const getJSON = async (url, opts = {}) => (await axios.get(url, { timeout: 45000, headers: { "User-Agent": UA }, ...opts })).data;

// ---------- Provider chains (each returns a direct media URL) ----------
const ytAudioProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.data?.dl, d?.data?.url, d?.result?.download?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.url, d?.data?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.result?.download?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.data?.downloadUrl, d?.data?.url); }
];
const ytVideoProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.data?.dl, d?.data?.url, d?.result?.download?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.url, d?.data?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.result?.download?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.data?.downloadUrl, d?.data?.url); }
];
const tiktokProviders = (u) => [
    async () => { const d = await getJSON(`https://www.tikwm.com/api/?url=${encodeURIComponent(u)}&hd=1`); const x = d?.data; if (!x) return null; const r = x.hdplay || x.play; return r?.startsWith("http") ? r : (r ? "https://www.tikwm.com" + r : null); },
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/tiktok?url=${encodeURIComponent(u)}`); return first(d?.data?.urls?.[0], d?.data?.video?.play, d?.data?.play); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/ttdl?url=${encodeURIComponent(u)}`); return first(d?.data?.data?.play, d?.data?.play, d?.result?.video?.url); }
];
const instaProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(u)}`); const a = d?.data; return first(a?.[0]?.url, a?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(u)}`); return first(d?.data?.[0]?.url, d?.result?.[0]?.url); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/igdownload?url=${encodeURIComponent(u)}`); return first(d?.result?.response?.data?.[0]?.url, d?.result?.[0]?.url); }
];
const facebookProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(u)}`); return first(d?.data?.hd, d?.data?.sd, d?.data?.[0]?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(u)}`); return first(d?.data?.[0]?.hd, d?.data?.[0]?.sd, d?.data?.hd, d?.data?.sd, d?.result?.hd, d?.result?.sd); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(u)}`); return first(d?.data?.hd_url, d?.data?.sd_url, d?.result?.hd, d?.result?.sd); }
];

/**
 * Main entry. site: youtube | tiktok | instagram | facebook | generic
 * kind: audio | video
 * Order: local yt-dlp -> public API chain (with real-media validation each time)
 */
export async function downloadMedia(url, { site = "generic", kind = "video" } = {}) {
    const errors = [];
    const apiChain = (
        site === "youtube" ? (kind === "audio" ? ytAudioProviders(url) : ytVideoProviders(url)) :
        site === "tiktok" ? tiktokProviders(url) :
        site === "instagram" ? instaProviders(url) :
        site === "facebook" ? facebookProviders(url) : []
    );

    // TikTok/IG/FB: APIs first (fast, no cookies), YouTube: yt-dlp first
    const order = site === "youtube" ? ["ytdlp", "api"] : ["api", "ytdlp"];
    for (const step of order) {
        if (step === "ytdlp") {
            try { return { buffer: await ytdlp(url, kind), via: "yt-dlp" }; }
            catch (e) { errors.push(e.message); }
        } else {
            for (let i = 0; i < apiChain.length; i++) {
                try {
                    const direct = await apiChain[i]();
                    if (!direct) { errors.push(`api#${i + 1}: no link`); continue; }
                    const buffer = await fetchBuffer(direct, kind === "audio" ? 20 * 1024 : 30 * 1024);
                    return { buffer, via: `api#${i + 1}` };
                } catch (e) { errors.push(`api#${i + 1}: ${(e.code || e.message || "").toString().slice(0, 80)}`); }
            }
        }
    }
    const err = new Error("All download methods failed");
    err.details = errors;
    throw err;
}

export const detectSite = (u = "") => {
    if (/(youtube\.com|youtu\.be)/i.test(u)) return "youtube";
    if (/(tiktok\.com)/i.test(u)) return "tiktok";
    if (/(instagram\.com|instagr\.am)/i.test(u)) return "instagram";
    if (/(facebook\.com|fb\.watch|fb\.com)/i.test(u)) return "facebook";
    return "generic";
};
export const firstUrl = (s = "") => (s.match(/https?:\/\/[^\s]+/i) || [])[0];
