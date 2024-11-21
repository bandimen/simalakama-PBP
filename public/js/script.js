async function addCourse() {
  const courseSelect = document.getElementById("courses");
  const courseList = document.getElementById("courseList");
  const selectedCourse = courseSelect.value;

  if (!selectedCourse) return;

  try {
    const courseData = JSON.parse(selectedCourse); 
    const { kodemk, nama, sks, semester } = courseData;

    // Cek apakah mata kuliah sudah ada di daftar
    const existingCourses = Array.from(courseList.children).map(item => {
      return item.textContent.split(" - ")[0].trim(); 
    });

    if (existingCourses.includes(kodemk)) {
      alert("Mata kuliah sudah ada di daftar.");
      return;
    }

    // Tambahkan ke daftar mata kuliah yang dipilih
    const listItem = document.createElement("li");
    listItem.className = "course-item";
    listItem.textContent = `${kodemk} - ${nama} (${sks} SKS, Semester ${semester})`;
    
    // Tombol untuk menghapus mata kuliah dari daftar
    const removeBtn = document.createElement("span");
    removeBtn.className = "text-white bg-red-700 rounded-full text-xs px-2 py-1 ml-2";
    removeBtn.textContent = "X";
    removeBtn.onclick = function () {
      // Cek apakah mata kuliah sudah diambil (dengan warna hijau)
      const selectedCourseBox = document.querySelector(`.courseBox-${kodemk}[style*="background-color: rgb(40, 167, 69)"]`); // Warna hijau

      if (selectedCourseBox) {
        // Jika mata kuliah sudah dipilih, tampilkan modal konfirmasi
        showCancelModal(kodemk, selectedCourseBox);
        const confirmCancelButton = document.getElementById("confirmCancelButton");

        const cancelModal = document.getElementById("cancelConfirmationModal");

        confirmCancelButton.onclick = () => {
          // Hapus dari daftar kursus
          courseList.removeChild(listItem);

          removeFromSheet(kodemk);
    
          // Hapus semua kotak jadwal dari tabel yang terkait dengan kodemk
          const courseBoxes = document.querySelectorAll(`.courseBox-${kodemk}`);
          courseBoxes.forEach(box => box.remove());
    
          // Tutup modal
          cancelModal.classList.add("hidden");
        };
      } else {
        // Jika belum dipilih, langsung hapus dari daftar
        const courseList = document.getElementById("courseList");
        courseList.removeChild(listItem);

        // Hapus semua kotak jadwal dari tabel yang terkait dengan kodemk
        const courseBoxes = document.querySelectorAll(`.courseBox-${kodemk}`);
        courseBoxes.forEach(box => box.remove());
      }
    };

    listItem.appendChild(removeBtn);
    courseList.appendChild(listItem);

    courseSelect.value = "";

    await fetchAndDisplaySchedule(kodemk, nama);
  } catch (error) {
    console.error("Error parsing course data:", error);
  }
}

async function fetchAndDisplaySchedule(kodemk, nama) {
  try {
    const response = await fetch(`/jadwal/${kodemk}`, { cache: "no-store" });
    const jadwalList = await response.json();

    function normalizeTimeToHour(waktu) {
      const [jam] = waktu.split(':').map(Number);
      return `${String(jam).padStart(2, '0')}:00`;
    }

    jadwalList.forEach(jadwal => {
      const { hari, waktu_mulai, waktu_selesai, kelas, ruang_id } = jadwal;

      const normalizedDay = hari.charAt(0).toUpperCase() + hari.slice(1).toLowerCase();
      const dayColumn = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].indexOf(normalizedDay);

      const startTime = normalizeTimeToHour(waktu_mulai);
      const row = document.querySelector(`#scheduleDisplay tbody tr[data-time="${startTime}"]`);

      if (row && dayColumn >= 0) {
        const cell = row.children[dayColumn + 1];

        // Bungkus elemen dengan div tambahan
        const wrapper = document.createElement("div");
        wrapper.className = "mb-2";

        const courseBox = document.createElement("div");
        courseBox.className = `
          bg-gray-100 text-black border border-gray-300 shadow-lg rounded-md p-2
          text-sm font-medium w-[180px] h-[120px] flex flex-col justify-between
          courseBox-${kodemk}
        `;
        courseBox.style.cursor = "pointer";

        // Tambahkan atribut data
        courseBox.setAttribute("data-mataKuliah", nama);
        courseBox.setAttribute("data-kelas", kelas);
        courseBox.setAttribute("data-hari", hari);
        courseBox.setAttribute("data-jam", `${waktu_mulai} - ${waktu_selesai}`);

        // Tambahkan konten ke dalam courseBox
        courseBox.innerHTML = `
          <div class="font-bold text-sm text-gray-900">${nama}</div>
          <div class="text-xs text-gray-600">Kode: ${kodemk}</div>
          <div class="text-xs text-gray-600">Kelas: ${kelas}</div>
          <div class="text-xs text-gray-600">Ruang: ${ruang_id}</div>
          <div class="text-xs text-gray-600">${waktu_mulai} - ${waktu_selesai}</div>
        `;

        // Tambahkan event klik
        courseBox.onclick = () => showConfirmationModal(kodemk, courseBox);

        // Masukkan courseBox ke dalam wrapper, lalu ke sel tabel
        wrapper.appendChild(courseBox);
        cell.appendChild(wrapper);

        console.log("Menambahkan courseBox:", {
          kodemk,
          nama,
          kelas,
          hari,
          ruang_id,
          waktu_mulai,
          waktu_selesai
        });
      } else {
        console.warn(`Tidak dapat menemukan row atau cell untuk waktu: ${startTime} pada hari: ${hari}`);
      }
    });
  } catch (error) {
    console.error("Error fetching schedule for", kodemk, error);
  }
}

// Tempat penyimpanan sementara untuk jadwal yang dipilih
let selectedCourses = [];

function showConfirmationModal(kodemk, selectedCourseBox) {
  const modal = document.getElementById("confirmationModal");
  modal.classList.remove("hidden");

  const confirmButton = document.getElementById("confirmButton");
  const cancelButton = document.getElementById("cancelButton");

  confirmButton.onclick = null;
  cancelButton.onclick = null;

  confirmButton.onclick = () => {
    if (selectedCourseBox.classList.contains("bg-gray-100")) {
      selectedCourseBox.style.backgroundColor = "#28a745";
      selectedCourseBox.classList.replace("text-black", "text-white");

      const courseInfo = {
        kodemk,
        mataKuliah: selectedCourseBox.getAttribute("data-mataKuliah"),
        kelas: selectedCourseBox.getAttribute("data-kelas"),
        hari: selectedCourseBox.getAttribute("data-hari"),
        jam: selectedCourseBox.getAttribute("data-jam"),
      };

      if (!courseInfo.mataKuliah || !courseInfo.kelas || !courseInfo.hari || !courseInfo.jam) {
        alert("Data jadwal tidak lengkap. Periksa elemen.");
        return;
      }

      selectedCourses.push(courseInfo);
      updateBottomSheet();

      const similarCourseBoxes = document.querySelectorAll(`.courseBox-${kodemk}`);
      similarCourseBoxes.forEach(box => {
        box.onclick = null;
        if (box !== selectedCourseBox) {
          box.style.backgroundColor = "#D1D5DB";
          box.classList.replace("text-black", "text-black");
        }
      });

      selectedCourseBox.onclick = () => showCancelModal(kodemk, selectedCourseBox);
      console.log(`Mata kuliah ${kodemk} dipilih.`);
    } else {
      alert("Mata kuliah ini sudah dipilih.");
    }

    modal.classList.add("hidden");
  };

  cancelButton.onclick = () => {
    modal.classList.add("hidden");
  };
}

// Fungsi untuk menampilkan modal konfirmasi pembatalan pengambilan mata kuliah
function showCancelModal(kodemk, selectedCourseBox) {
  const cancelModal = document.getElementById("cancelConfirmationModal");
  cancelModal.classList.remove("hidden");

  const confirmCancelButton = document.getElementById("confirmCancelButton");
  const cancelCancelButton = document.getElementById("cancelCancelButton");

  confirmCancelButton.onclick = () => {
    // Hapus dari array
    selectedCourses = selectedCourses.filter(course => course.kodemk !== kodemk);
    updateBottomSheet();

    // Mata kuliah dibatalkan, kembalikan warna dan aktifkan kembali klik
    selectedCourseBox.style.backgroundColor = ""; // Kembalikan ke warna semula
    selectedCourseBox.classList.replace("text-white", "text-black");

    const similarCourseBoxes = document.querySelectorAll(`.courseBox-${kodemk}`);
    similarCourseBoxes.forEach(box => {
      box.style.backgroundColor = ""; // Kembalikan ke warna semula
      box.classList.replace("text-white", "text-black");
      box.onclick = () => showConfirmationModal(kodemk, box); // Aktifkan kembali klik
    });

    // Tutup modal
    cancelModal.classList.add("hidden");
  };

  cancelCancelButton.onclick = () => {
    cancelModal.classList.add("hidden");
  };
}

let bottomSheetData = []; // Variabel untuk menyimpan data bottomSheet

// Fungsi untuk memperbarui konten bottom sheet
function updateBottomSheet() {
  const bottomSheetTable = document.getElementById("bottomSheetTable").querySelector("tbody");
  bottomSheetTable.innerHTML = ""; // Hapus konten sebelumnya

  if (selectedCourses.length === 0) {
    // Tampilkan pesan kosong jika tidak ada jadwal yang dipilih
    bottomSheetTable.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-gray-500">Belum ada jadwal yang dipilih.</td>
      </tr>
    `;
    return;
  }

  // Kosongkan bottomSheetData sebelum diperbarui
  bottomSheetData = [];

  // Tambahkan jadwal yang dipilih ke tabel dan update bottomSheetData
  selectedCourses.forEach((course, index) => {
    bottomSheetTable.innerHTML += `
      <tr>
        <td class="border border-gray-300 px-4 py-2">${index + 1}</td>
        <td class="border border-gray-300 px-4 py-2">${course.kodemk}</td>
        <td class="border border-gray-300 px-4 py-2">${course.mataKuliah}</td>
        <td class="border border-gray-300 px-4 py-2">${course.kelas}</td>
        <td class="border border-gray-300 px-4 py-2">${course.hari}</td>
        <td class="border border-gray-300 px-4 py-2">${course.jam}</td>
      </tr>
    `;

    // Update data array
    bottomSheetData.push({
      kodemk: course.kodemk,
      kelas: course.kelas,
    });
  });

  // Debug isi bottomSheetData
  console.log("Data yang terkumpul di bottomSheetData:", bottomSheetData);

  // Kirim data terbaru secara otomatis
  sendBottomSheetData();
}

// Fungsi untuk mengirim data ke backend
function sendBottomSheetData() {
  if (bottomSheetData.length === 0) {
    console.log("Tidak ada data untuk dikirim.");
    return;
  }

  console.log("Mengirim data ke backend:", bottomSheetData);

  fetch("/irs-detail/store", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
    },
    body: JSON.stringify({ bottomSheetData }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Respon dari server:", data);
      alert(data.message || "Data berhasil dikirim.");
    })
    .catch((error) => {
      console.error("Terjadi kesalahan saat mengirim data:", error);
      alert("Terjadi kesalahan saat mengirim data.");
    });
}

// Event untuk toggle bottom sheet
document.getElementById("toggleButton").onclick = () => {
  const bottomSheet = document.getElementById("bottomSheet");
  const content = document.getElementById("content");

  if (bottomSheet.classList.contains("translate-y-full")) {
    bottomSheet.classList.remove("translate-y-full");
    bottomSheet.classList.add("translate-y-0");
    content.classList.remove("hidden");
  } else {
    bottomSheet.classList.add("translate-y-full");
    bottomSheet.classList.remove("translate-y-0");
    content.classList.add("hidden");
  }
};

// function addToSheet(kodemk, selectedCourseBox) {
//   const bottomSheetTableBody = document.querySelector("#bottomSheetTable tbody");

//   // Hapus pesan "Tidak ada jadwal yang dipilih" jika ada
//   const emptyMessageRow = document.getElementById("emptyMessage");
//   if (emptyMessageRow) {
//     bottomSheetTableBody.removeChild(emptyMessageRow);
//   }

//   // Pastikan tidak ada duplikasi
//   const existingRows = Array.from(bottomSheetTableBody.children).map(row => row.dataset.kodemk);
//   if (existingRows.includes(kodemk)) {
//     console.warn(`Mata kuliah ${kodemk} sudah ada di tabel bottomSheet.`);
//     return;
//   }

//   // Ambil informasi mata kuliah dari courseBox
//   const [kodeMK, kelas, ruang, waktu] = selectedCourseBox.innerText.split("\n").map(text => text.trim());
//   const matakuliah = kodeMK.split(" - ")[1] || "Mata Kuliah Tidak Diketahui"; // Nama mata kuliah diambil dari teks kodeMK jika ada

//   // Tambahkan baris baru ke tabel
//   const newRow = document.createElement("tr");
//   newRow.dataset.kodemk = kodemk; // Tandai baris dengan kodemk
//   newRow.innerHTML = `
//     <td class="border px-4 py-2">${bottomSheetTableBody.children.length + 1}</td>
//     <td class="border px-4 py-2">${kodeMK.split(" - ")[0]}</td>
//     <td class="border px-4 py-2">${matakuliah}</td>
//     <td class="border px-4 py-2">${kelas.replace("Kelas: ", "")}</td>
//     <td class="border px-4 py-2">${ruang.replace("Ruang: ", "")}</td>
//     <td class="border px-4 py-2">${waktu}</td>
//   `;
//   bottomSheetTableBody.appendChild(newRow);
  
//   // saveSelectedCourse(kodemk, selectedCourseBox.dataset.kelas);
// }

// function removeFromSheet(kodemk) {
//   const bottomSheetTableBody = document.querySelector("#bottomSheetTable tbody");
//   const rows = Array.from(bottomSheetTableBody.children);

//   const rowToRemove = rows.find(row => row.dataset.kodemk === kodemk);
//   if (rowToRemove) {
//       bottomSheetTableBody.removeChild(rowToRemove);
//   }

//   const remainingRows = Array.from(bottomSheetTableBody.children).filter(row => row.dataset.kodemk);
//   remainingRows.forEach((row, index) => {
//       row.children[0].textContent = index + 1; // Update nomor urut
//   });

//   if (remainingRows.length === 0) {
//       const emptyMessageRow = document.createElement("tr");
//       emptyMessageRow.id = "emptyMessage";
//       emptyMessageRow.innerHTML = `
//           <td colspan="6" class="text-center text-gray-500">Tidak ada jadwal yang dipilih</td>
//       `;
//       bottomSheetTableBody.appendChild(emptyMessageRow);
//   }

//   // Kirim data terbaru ke backend
//   saveBottomSheetData();
// }

// function getBottomSheetData() {
//   const bottomSheetTableBody = document.querySelector("#bottomSheetTable tbody");

//   // Ambil semua baris data yang ada di tabel
//   const rows = Array.from(bottomSheetTableBody.children);

//   // Ekstrak data dari setiap baris
//   const data = rows
//     .filter(row => row.dataset.kodemk) // Hanya ambil baris yang memiliki atribut dataset.kodemk
//     .map(row => {
//       const cells = row.querySelectorAll("td");
//       return {
//         kodemk: row.dataset.kodemk, // Ambil kode MK dari dataset
//         kelas: cells[3].textContent.trim(), // Kolom kelas
//       };
//     });

//   return data;
// }

// // Fungsi untuk menyimpan data secara real-time
// function saveBottomSheetData() {
//   const bottomSheetData = getBottomSheetData();

//   fetch("/irs-detail/store", {
//       method: "POST",
//       headers: {
//           "Content-Type": "application/json",
//           "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
//       },
//       body: JSON.stringify({ bottomSheetData }),
//   })
//       .then(response => {
//           if (response.ok) {
//               return response.json();
//           } else {
//               return Promise.reject(response.json());
//           }
//       })
//       .then(result => {
//           console.log("Data berhasil disimpan:", result);
//       })
//       .catch(error => {
//           console.error("Kesalahan saat menyimpan data:", error);
//       });
// }


// // Panggil fungsi monitor saat halaman dimuat
// document.addEventListener("DOMContentLoaded", monitorBottomSheetTable);

// const bottomSheet = document.getElementById('bottomSheet');
// const toggleButton = document.getElementById('toggleButton');
// const content = document.getElementById('content');
// const toggleIcon = document.getElementById('toggleIcon');
// let isExpanded = false;

// // Toggle Expand/Minimize
// toggleButton.addEventListener('click', () => {
//   isExpanded = !isExpanded;

//   if (isExpanded) {
//     bottomSheet.style.transform = 'translateY(0)'; // Expand
//     content.classList.remove('hidden');
//     toggleIcon.innerHTML = `&#x25BC;`; // Panah ke bawah
//   } else {
//     bottomSheet.style.transform = 'translateY(90%)'; // Minimize
//     content.classList.add('hidden');
//     toggleIcon.innerHTML = `&#x25B2;`; // Panah ke atas
//   }
// });


// function saveSelectedCourse(kodemk, kelas) {
//   const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
//   fetch('/api/save-selected-course', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRF-TOKEN': csrfToken,
//     },
//     body: JSON.stringify({
//       kodemk: kodemk,
//       kelas: kelas,
//     }),
//   })
//   .then(response => {
//     if (!response.ok) {
//       console.error('Gagal menyimpan mata kuliah:', response.statusText);
//     }
//   })
//   .catch(error => console.error('Terjadi kesalahan:', error));
// }

// function saveSelectedSchedule(jadwal) {
//   fetch('/irs/store', {
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json',
//           'X-CSRF-Token': csrfToken
//       },
//       body: JSON.stringify({
//           nim: "24060122130077",
//           semester: 5,
//           tahun_ajaran: "2023/2024",
//           total_sks: 0,
//           jadwal: jadwal // Mengirim data jadwal yang dipilih
//       })
//   })
//   .then(response => response.json())
//   .then(result => {
//       if (result.success) {
//           alert("Jadwal berhasil disimpan ke IRS.");
//       } else {
//           console.error("Gagal menyimpan jadwal:", result.error);
//           alert("Gagal menyimpan jadwal.");
//       }
//   })
//   .catch(error => console.error('Error saving schedule:', error));
// }

// // Fungsi untuk menambahkan jadwal yang dipilih ke server
// function addScheduleToIrs(kodemk, jadwalKuliahId) {
//   const irsId = document.getElementById('irsId').value; // Ambil ID IRS (hidden input)

//   // Kirim data ke server menggunakan fetch
//   fetch('/irs-detail/add', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content, // CSRF Token untuk keamanan
//     },
//     body: JSON.stringify({
//       irs_id: irsId,
//       kodemk: kodemk,
//       jadwal_kuliah_id: jadwalKuliahId,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.success) {
//         console.log('Jadwal berhasil dimasukkan ke IRS Detail:', data);
//       } else {
//         console.error('Gagal memasukkan jadwal ke IRS Detail:', data.error);
//       }
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// }

// // Fungsi untuk menghapus jadwal dari IRS Detail
// function removeScheduleFromIrs(kodemk) {
//   const irsId = document.getElementById('irsId').value; // Ambil ID IRS

//   // Kirim data ke server untuk menghapus jadwal
//   fetch('/irs-detail/remove', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
//     },
//     body: JSON.stringify({
//       irs_id: irsId,
//       kodemk: kodemk,
//     }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.success) {
//         console.log('Jadwal berhasil dihapus dari IRS Detail:', data);
//       } else {
//         console.error('Gagal menghapus jadwal dari IRS Detail:', data.error);
//       }
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// }

// // Event onclick untuk pilihan jadwal
// document.querySelectorAll('.courseBox').forEach((courseBox) => {
//   courseBox.onclick = () => {
//     const kodemk = courseBox.dataset.kodemk;
//     const jadwalKuliahId = courseBox.dataset.jadwalKuliahId;

//     if (courseBox.classList.contains('selected')) {
//       removeScheduleFromIrs(kodemk); // Hapus jadwal
//       courseBox.classList.remove('selected');
//     } else {
//       addScheduleToIrs(kodemk, jadwalKuliahId); // Tambahkan jadwal
//       courseBox.classList.add('selected');
//     }
//   };
// });


