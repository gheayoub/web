import { db } from "./firebase-init.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM Elements
const postForm = document.getElementById('postForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const submitBtn = document.getElementById('submitBtn');
const alertBox = document.querySelector('[data-alert]');
const guestMessage = document.getElementById('guestMessage');
const feedContainer = document.getElementById('communityFeed');
const feedLoader = document.getElementById('feedLoader');

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
      const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleString('id-ID') : 'Baru saja';
      
      const card = document.createElement('div');
      card.className = 'post-card animate-fade-up';
      
      card.innerHTML = `
        <h4 class="post-title">${data.title}</h4>
        <div class="post-meta">Oleh <b>${data.username}</b> pada ${dateStr}</div>
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

// Jalankan
init();
