let allResults = [];

function isValidNumber(num) {
    return /^62\d{8,15}$/.test(num);
}

async function cekNomor() {
    const textarea = document.getElementById("nomor");
    const loading = document.getElementById("loading");
    const hasil = document.getElementById("hasil");

    let nomorList = textarea.value
        .split("\n")
        .map(n => n.trim())
        .filter(n => n.length > 0);

    const invalidNumbers = nomorList.filter(n => !isValidNumber(n));
    if (invalidNumbers.length > 0) {
        alert("Format nomor salah:\n" + invalidNumbers.join("\n") + "\n\nFormat harus: 628xxxxxxxxx");
        return;
    }

    if (nomorList.length === 0) {
        alert("Masukkan minimal 1 nomor!");
        return;
    }

    loading.innerText = "⏳ Memproses...";
    hasil.innerHTML = "";

    try {
        const response = await fetch("/api/check_status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ msisdns: nomorList })
        });

        const data = await response.json();

        if (!data.results) {
            loading.innerText = "";
            hasil.innerHTML = "❌ Gagal mengambil data";
            return;
        }

        allResults = data.results;
        loading.innerText = "";
        renderTable();

    } catch (error) {
        loading.innerText = "";
        hasil.innerHTML = "❌ Terjadi kesalahan jaringan";
        console.error(error);
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
        const statusClass = r.status === "AKTIF" ? "status-AKTIF" : "status-TIDAK";
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

// Fungsi copyAll sesuai filter
function copyAll() {
    const filterKode = document.getElementById("filterKode").value;
    let filtered = allResults;

    if (filterKode !== "ALL") {
        filtered = allResults.filter(r => String(r.code) === filterKode);
    }

    if (filtered.length === 0) {
        alert("Tidak ada nomor untuk disalin");
        return;
    }

    const textToCopy = filtered.map(r => r.nomor).join("\n");
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert("✅ Nomor berhasil disalin ke clipboard"))
        .catch(err => alert("❌ Gagal menyalin nomor: " + err));
}
