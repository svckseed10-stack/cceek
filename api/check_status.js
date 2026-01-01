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
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({ msisdn })
        });

        // HTTP 404 → ERROR
        if (response.status === 404) {
            return ["ERROR", "-", 404];
        }

        // selain 200 → ERROR
        if (response.status !== 200) {
            return ["ERROR", "-", response.status];
        }

        const res = await response.json();

        /**
         * HTTP 200 tapi status false
         * → tidak terdaftar
         */
        if (res.status === false) {
            return ["TIDAK TERDAFTAR", "-", 200];
        }

        const actEnd = res.data?.actEndDate || "";

        /**
         * tidak ada masa aktif
         * → kadaluarsa
         */
        if (!actEnd) {
            return ["KADALUARSA", "-", 200];
        }

        const exp = new Date(actEnd);
        const today = new Date();

        // aktif / kadaluarsa
        if (exp >= today) {
            return ["AKTIF", actEnd, 200];
        } else {
            return ["KADALUARSA", actEnd, 200];
        }

    } catch (err) {
        return ["ERROR", "-", "ERROR"];
    }
};

module.exports = async (req, res) => {
    try {
        const { msisdns } = req.body;

        if (!msisdns || msisdns.length === 0) {
            return res.status(400).json({ error: "No MSISDNs provided" });
        }

        const results = await Promise.all(
            msisdns.map(async (msisdn) => {
                const [status, masa_aktif, code] = await klasifikasi_nomor(msisdn);
                return {
                    nomor: msisdn,
                    status,
                    masa_aktif,
                    code
                };
            })
        );

        res.status(200).json({ results });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};
