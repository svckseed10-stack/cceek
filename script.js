<script>
let dataHasil = [];

// auto convert 08xxxx → 628xxxx
function normalizeNumber(num) {
    num = num.trim();
    if (num.startsWith("08")) {
        return "62" + num.substring(1);
    }
    return num;
}

function cekNomor() {
    const input = document.getElementById("nomor").value.trim();
    const loading = document.getElementById("loading");

    if (!input) {
        alert("Masukkan nomor terlebih dahulu");
        return;
    }

    loading.innerText = "Memproses...";
    dataHasil = [];

    const listNomor = input.split("\n").map(n => normalizeNumber(n));

    // simulasi response API
    setTimeout(() => {
        listNomor.forEach(nomor => {
            const isAktif = Math.random() > 0.4;

            dataHasil.push({
                nomor,
                kode: isAktif ? 200 : 404,
                status: isAktif ? "AKTIF" : "TIDAK AKTIF"
            });
        });

        loading.innerText = "";
        renderTable();
    }, 800);
}

function renderTable() {
    const filter = document.getElementById("filterKode").value;
    const hasil = document.getElementById("hasil");

    let filtered = dataHasil;
    if (filter !== "ALL") {
        filtered = dataHasil.filter(d => d.kode == filter);
    }

    if (filtered.length === 0) {
        hasil.innerHTML = "<p>Tidak ada data</p>";
        return;
    }

    let html = `
        <table>
            <tr>
                <th>No</th>
                <th>Nomor</th>
                <th>Kode</th>
                <th>Status</th>
            </tr>
    `;

    filtered.forEach((d, i) => {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${d.nomor}</td>
                <td>${d.kode}</td>
                <td class="status-${d.status.replace(" ", "")}">
                    ${d.status}
                </td>
            </tr>
        `;
    });

    html += "</table>";
    hasil.innerHTML = html;
}

// Copy sesuai filter (ALL / 200 / 404)
function copyAll() {
    const filter = document.getElementById("filterKode").value;

    let filtered = dataHasil;
    if (filter !== "ALL") {
        filtered = dataHasil.filter(d => d.kode == filter);
    }

    if (filtered.length === 0) {
        alert("Tidak ada data untuk dicopy");
        return;
    }

    const text = filtered.map(d =>
        `${d.nomor} | ${d.kode} | ${d.status}`
    ).join("\n");

    navigator.clipboard.writeText(text).then(() => {
        alert("Berhasil di-copy sesuai filter!");
    });
}
</script>
