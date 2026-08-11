import { db } from "./firebase-init.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  serverTimestamp,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const postForm = document.getElementById('postForm');
const postTitle = document.getElementById('postTitle');
const postCategory = document.getElementById('postCategory');
const postContent = document.getElementById('postContent');
const submitBtn = document.getElementById('submitBtn');
const alertBox = document.querySelector('[data-alert]');
const guestMessage = document.getElementById('guestMessage');
const feedContainer = document.getElementById('communityFeed');
const feedLoader = document.getElementById('feedLoader');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editPostId = document.getElementById('editPostId');
const editPostTitle = document.getElementById('editPostTitle');
const editPostCategory = document.getElementById('editPostCategory');
const editPostContent = document.getElementById('editPostContent');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

let currentUser = null;

// Initialize Community Page
async function init() {
  checkAuthStatus();
  await loadPosts();
}

function showAlert(msg, isError = false) {
  alertBox.textContent = msg;
  alertBox.style.display = 'block';
  alertBox.style.background = isError ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)';
  alertBox.style.color = isError ? '#ffaaaa' : '#aaffaa';
  setTimeout(() => { alertBox.style.display = 'none'; }, 5000);
}

// Cek apakah user sudah login melalui VMMO_API
async function checkAuthStatus() {
  if (window.VMMO_API && VMMO_API.getToken()) {
    try {
      const data = await VMMO_API.me();
      currentUser = data.username || 'User';
      postForm.style.display = 'block';
      guestMessage.style.display = 'none';
    } catch (e) {
      currentUser = null;
      postForm.style.display = 'none';
      guestMessage.style.display = 'block';
    }
  } else {
    currentUser = null;
    postForm.style.display = 'none';
    guestMessage.style.display = 'block';
  }
}

// Cek limit: Maksimal 2 post per hari per user
async function checkDailyLimit(username) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const postsRef = collection(db, "posts");
  // Kita HANYA memfilter username dari database, untuk menghindari error "Index Required".
  const q = query(postsRef, where("username", "==", username));
  
  const snapshot = await getDocs(q);
  
  // Filter tanggal dilakukan di JavaScript (client)
  let todayCount = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.createdAt) {
      const postDate = data.createdAt.toDate();
      if (postDate >= startOfDay) {
        todayCount++;
      }
    }
  });

  return todayCount;
}

// Fungsi Submit Form
if (postForm) {
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return showAlert("Anda harus login untuk memposting.", true);

    const title = postTitle.value.trim();
    const category = postCategory.value;
    const content = postContent.value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memeriksa limit...';

    try {
      // Cek limit harian
      const todayPostsCount = await checkDailyLimit(currentUser);
      if (todayPostsCount >= 2) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Postingan';
        return showAlert("Batas harian tercapai. Anda hanya boleh memposting 2 kali sehari.", true);
      }

      submitBtn.textContent = 'Menyimpan data...';

      // Simpan ke Firestore
      await addDoc(collection(db, "posts"), {
        title,
        category,
        content,
        username: currentUser,
        createdAt: serverTimestamp()
      });

      showAlert("Postingan berhasil diterbitkan!", false);
      postForm.reset();
      loadPosts(); // Reload feed

    } catch (error) {
      console.error("Gagal memposting:", error);
      showAlert("Gagal membuat postingan. Pastikan database rule mengizinkan penulisan.", true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Postingan';
    }
  });
}

// Menampilkan daftar postingan
async function loadPosts() {
  feedLoader.style.display = 'block';
  feedContainer.innerHTML = '';

  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    feedLoader.style.display = 'none';

    if (snapshot.empty) {
      feedContainer.innerHTML = '<p class="muted">Belum ada postingan. Jadilah yang pertama!</p>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString('id-ID') : 'Baru saja';
      const badgeColor = getCategoryColor(data.category);
      
      const card = document.createElement('div');
      card.className = 'post-card animate-fade-up';
      
      let editBtnHtml = '';
      if (currentUser && currentUser === data.username) {
        // Simpan data di atribut data- untuk mudah diambil saat edit
        editBtnHtml = `<button class="btn-edit" onclick="openEditModal('${docId}', \`${encodeURIComponent(data.title)}\`, '${data.category || 'Lainnya'}', \`${encodeURIComponent(data.content)}\`)">Edit</button>`;
      }

      card.innerHTML = `
        <div class="post-header">
          <div>
            <h4 class="post-title">
              <span class="badge" style="background:${badgeColor}">${data.category || 'Lainnya'}</span> 
              ${data.title}
            </h4>
            <div class="post-meta">Oleh <b>${data.username}</b> pada ${dateStr}</div>
          </div>
          ${editBtnHtml}
        </div>
        <div class="post-content">${data.content}</div>
      `;
      feedContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Gagal memuat feed:", error);
    feedLoader.style.display = 'none';
    feedContainer.innerHTML = '<p style="color:#ffaaaa">Gagal mengambil data postingan. Pastikan Security Rules Database di Firebase Console mengizinkan pembacaan (Read).</p>';
  }
}

// Fungsi penunjang warna kategori
function getCategoryColor(category) {
  switch (category) {
    case 'Tutorial': return '#28a745';
    case 'Script': return '#007bff';
    case 'Tanya Jawab': return '#ffc107';
    case 'Diskusi': return '#17a2b8';
    default: return '#6c757d';
  }
}

// Buka modal edit
window.openEditModal = function(id, encodedTitle, category, encodedContent) {
  editPostId.value = id;
  editPostTitle.value = decodeURIComponent(encodedTitle);
  editPostCategory.value = category;
  editPostContent.value = decodeURIComponent(encodedContent);
  editModal.style.display = 'flex';
}

// Tutup modal edit
if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', () => {
    editModal.style.display = 'none';
    editForm.reset();
  });
}

// Handler form edit
if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const id = editPostId.value;
    const title = editPostTitle.value.trim();
    const category = editPostCategory.value;
    const content = editPostContent.value.trim();

    saveEditBtn.disabled = true;
    saveEditBtn.textContent = 'Menyimpan...';

    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        title,
        category,
        content
      });

      showAlert("Postingan berhasil diperbarui!", false);
      editModal.style.display = 'none';
      loadPosts(); // Reload feed untuk menampilkan perubahan
    } catch (error) {
      console.error("Gagal mengedit:", error);
      showAlert("Gagal menyimpan perubahan. Pastikan Anda memiliki koneksi internet.", true);
    } finally {
      saveEditBtn.disabled = false;
      saveEditBtn.textContent = 'Simpan Perubahan';
    }
  });
}

// Jalankan
init();
