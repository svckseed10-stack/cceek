async function cekNomor() {
    const textarea = document.getElementById("nomor");
    const loading = document.getElementById("loading");
    const hasil = document.getElementById("hasil");

    // Ambil nomor per baris
    const nomorList = textarea.value
        .split("\n")
        .map(n => n.trim())
        .filter(n => n.length > 0);

    if (nomorList.length === 0) {
        alert("Masukkan minimal 1 nomor!");
        return;
    }

    loading.innerText = "⏳ Memproses...";
    hasil.innerHTML = "";

    try {
        const response = await fetch("/api/check_status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ msisdns: nomorList })
        });

        const data = await response.json();

        if (!data.results) {
            loading.innerText = "";
            hasil.innerHTML = "❌ Gagal mengambil data";
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

        data.results.forEach((r, i) => {
            table += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${r.nomor}</td>
                    <td>${r.status}</td>
                    <td>${r.masa_aktif}</td>
                    <td>${r.code}</td>
                </tr>
            `;
        });

        table += `</table>`;

        loading.innerText = "";
        hasil.innerHTML = table;

    } catch (error) {
        loading.innerText = "";
        hasil.innerHTML = "❌ Terjadi kesalahan jaringan";
        console.error(error);
    }
}
