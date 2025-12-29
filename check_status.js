const fetch = require('node-fetch');  // Install node-fetch untuk request HTTP

const URL = "https://tri.co.id/api/v1/information/sim-status";

const HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": "https://tri.co.id",
    "Referer": "https://tri.co.id/"
};

const klasifikasi_nomor = async (msisdn) => {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ msisdn: msisdn })
        });

        if (response.status === 404) {
            return ["TIDAK TERDAFTAR", "-", response.status];
        }

        if (response.status !== 200) {
            return ["ERROR", "-", response.status];
        }

        const res = await response.json();

        if (!res.status) {
            return ["TIDAK TERDAFTAR", "-", response.status];
        }

        const data = res.data || {};
        const act_end = data.actEndDate || "";

        if (!act_end) {
            return ["KADALUARSA", "-", response.status];
        }

        const exp_date = new Date(act_end);
        const today = new Date();

        if (exp_date >= today) {
            return ["AKTIF", act_end, response.status];
        } else {
            return ["KADALUARSA", act_end, response.status];
        }
    } catch (error) {
        return ["TIDAK TERDAFTAR", "-", "ERROR"];
    }
};

// Vercel function handler
module.exports = async (req, res) => {
    try {
        const { msisdns } = req.body;

        if (!msisdns || msisdns.length === 0) {
            return res.status(400).json({ error: "No MSISDNs provided" });
        }

        const results = await Promise.all(msisdns.map(async (msisdn) => {
            const [status, masa_aktif, code] = await klasifikasi_nomor(msisdn);
            return { nomor: msisdn, status, masa_aktif, code };
        }));

        res.status(200).json({ results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Terjadi kesalahan di server' });
    }
};
