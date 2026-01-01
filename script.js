let allResults = [];

// validasi nomor 62
function isValidNumber(num) {
    return /^62\d{8,15}$/.test(num);
}

// normalisasi 08 → 62
function normalizeNumber(num) {
    num = num.replace(/\s+/g, "");

    if (num.startsWith("08")) {
        return "62" + num.slice(1);
    }

    if (num.startsWith("62")) {
        return num;
    }

    return null;
}

async function cekNomor() {
    const textarea = document.getElementById("nomor");
    const loading = document.getElementById("loading");
    const hasil = document.getElementById("hasil");
    const btn = document.getElementById("btnCek");

    let rawList = textarea.value
        .split("\n")
        .map(n => n.trim())
        .filter(n => n.length > 0);

    let nomorList = [];
    let invalidNumbers = [];

    rawList.forEach(n => {
        const normalized = normalizeNumber(n);
        if (!normalized || !isValidNumber(normalized)) {
            invalidNumbers.push(n);
        } else {
            nomorList.push(normalized);
        }
    });

    if (invalidNumbers.length > 0) {
        alert("Format nomor salah:\n" + invalidNumbers.join("\n"));
        return;
    }

    if (nomorList.length === 0) {
        alert("Masukkan minimal 1 nomor!");
        return;
    }

    btn.disabled = true;
    loading.innerText = "⏳ Memproses...";
    hasil.innerHTML = "";

    try {
        const response = await fetch("/api/check_status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ msisdns: nomorList })
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();
        allResults = data.results || [];

        loading.innerText = "";
        renderTable();
    } catch (error) {
        loading.innerText = "";
        hasil.innerHTML = "❌ Terjadi kesalahan";
        console.error(error);
    } finally {
        btn.disabled = false;
    }
}

function renderTable() {
    const hasil = document.getElementById("hasil");
    const filterKode = document.getElementById("filterKode").value;

    let filtered = allResults;
    if (filterKode !== "ALL") {
        filtered = allResults.filter(r => String(r.code) === filterKode);
    }

    if (filtered.length === 0) {
        hasil.innerHTML = "<p>Tidak ada data</p>";
        return;
    }

    let table = `
        <table>
            <tr>
                <th>No</th>
                <th>Nomor</th>
                <th>Status</th>
                <th>Masa Aktif</th>
                <th>Kode</th>
            </tr>
    `;

    filtered.forEach((r, i) => {
        const statusClass =
            r.status === "AKTIF" ? "status-AKTIF" :
            r.status === "KADALUARSA" ? "status-KADALUARSA" :
            "status-TIDAK";

        table += `
            <tr>
                <td>${i + 1}</td>
                <td>${r.nomor}</td>
                <td class="${statusClass}">${r.status}</td>
                <td>${r.masa_aktif}</td>
                <td>${r.code}</td>
            </tr>
        `;
    });

    table += `</table>`;
    hasil.innerHTML = table;
}

// COPY sesuai filter
function copyAll() {
    const filterKode = document.getElementById("filterKode").value;
    let filtered = allResults;

    if (filterKode !== "ALL") {
        filtered = allResults.filter(r => String(r.code) === filterKode);
    }

    if (filtered.length === 0) {
        alert("Tidak ada data untuk disalin");
        return;
    }

    let textToCopy = "";

    if (filterKode === "404") {
        textToCopy = filtered.map(r => r.nomor).join("\n");
    } else {
        textToCopy = filtered.map(r =>
            `${r.nomor} | ${r.status} | ${r.masa_aktif} | ${r.code}`
        ).join("\n");
    }

    navigator.clipboard.writeText(textToCopy)
        .then(() => alert("✅ Berhasil disalin"))
        .catch(err => alert("❌ Gagal menyalin: " + err));
}
