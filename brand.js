// Central brand/owner settings — edit here to change names everywhere
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const BRAND = {
    name: "MARCO MALIK & WAQAR WRITES MD",
    short: "MARCO MALIK & WAQAR WRITES",
    version: "V1.0",
    website: "https://marco-waqar-mini-bot-info-web.vercel.app",
    owners: [
        { name: "Marco Malik", role: "Developer", age: 19, country: "Pakistan", city: "Rajanpur (District Rajanpur)", number: "923377857866" },
        { name: "Waqar Writes", role: "Developer", age: 21, country: "Pakistan", city: "Karachi", number: "923293245445" }
    ],
    footer: "💠 *Powered by MARCO MALIK & WAQAR WRITES MD*\n🌐 https://marco-waqar-mini-bot-info-web.vercel.app"
};

export const OWNER_NUMBERS = BRAND.owners.map(o => o.number);

const asset = (f) => {
    try {
        const p = join(process.cwd(), "assets", f);
        return existsSync(p) ? readFileSync(p) : null;
    } catch { return null; }
};
export const getAsset = asset;
