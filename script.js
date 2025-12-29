document.getElementById('nomorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Ambil input nomor dari form
    const nomorInput = document.getElementById('nomor').value;
    const nomorList = nomorInput.split(',').map(n => n.trim());

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Memproses...'; // Tampilkan pesan loading

    try {
        // Kirim request POST ke serverless function di Vercel
       const response = await fetch('https://ceknomor-eight.vercel.app/api/check_status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ msisdns: nomorList })
        });

        // Parse respons JSON
        const data = await response.json();

        // Tampilkan hasil
        if (data.results) {
            resultsDiv.innerHTML = '<ul>' + data.results.map(result => {
                return `<li><strong>${result.nomor}</strong>: ${result.status} (Masa Aktif: ${result.masa_aktif})</li>`;
            }).join('') + '</ul>';
        } else {
            resultsDiv.innerHTML = 'Terjadi kesalahan saat memproses permintaan.';
        }

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = 'Terjadi kesalahan jaringan.';
    }
});

