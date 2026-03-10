const firebaseConfig = {
    apiKey: "AIzaSyAUtC2YMcUGxmnesHVTEpNa2Tkh-4KmDrs",
    authDomain: "mice-7669b.firebaseapp.com",
    databaseURL: "https://mice-7669b-default-rtdb.firebaseio.com",
    projectId: "mice-7669b",
    storageBucket: "mice-7669b.firebasestorage.app",
    messagingSenderId: "1031366587925",
    appId: "1:1031366587925:web:36eb5dc84d1f9fc6ebc01c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const clickSoundUrl = "https://www.fesliyanstudios.com/play-mp3/387";
const clickAudio = new Audio(clickSoundUrl);

document.addEventListener('click', () => {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(e => {}); 
});

function toggleBGM() {
    const bgm = document.getElementById('bgmAudio');
    const toggle = document.getElementById('bgmToggle');
    if (toggle.checked) bgm.play();
    else bgm.pause();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function hideAll() {
    ['view-home', 'view-list', 'view-comments'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('nav-header').classList.remove('hidden');
}

function goBack() { location.reload(); }

let curCat = '', curCls = '';

function openClasses(catId, title) {
    curCat = catId; hideAll();
    document.getElementById('view-list').classList.remove('hidden');
    document.getElementById('page-title').innerText = title;

    db.ref(`padhai/ncert/${catId}`).once('value', s => {
        const data = s.val();
        let html = '';
        for(let cls in data) {
            html += `<div class="col" onclick="openBooks('${cls}')">
                        <div class="cat-card"><i class="fas fa-graduation-cap"></i><h6>${cls.replace('class','Class ')}</h6></div>
                     </div>`;
        }
        document.getElementById('card-content').innerHTML = html;
    });
}

function openBooks(clsId) {
    curCls = clsId;
    db.ref(`padhai/ncert/${curCat}/${clsId}`).once('value', s => {
        const data = s.val();
        let html = '';
        for(let bookId in data) {
            const firstKey = Object.keys(data[bookId])[0];
            html += `<div class="col" onclick="openChapters('${bookId}')">
                        <div class="cat-card"><i class="fas fa-book"></i><h6>${data[bookId][firstKey].bookName}</h6></div>
                     </div>`;
        }
        document.getElementById('card-content').innerHTML = html;
    });
}

function openChapters(bookId) {
    db.ref(`padhai/ncert/${curCat}/${curCls}/${bookId}`).once('value', s => {
        const data = s.val();
        let html = '';
        Object.values(data).sort((a,b) => a.sno - b.sno).forEach(ch => {
            html += `<div class="col" onclick="redirectToPdf('${ch.pdf}')">
                        <div class="cat-card"><i class="fas fa-file-pdf text-danger"></i><h6>${ch.sno}. ${ch.chapterName}</h6><small class="text-success">Open PDF</small></div>
                     </div>`;
        });
        document.getElementById('card-content').innerHTML = html;
    });
}

function redirectToPdf(url) { window.open(url, '_blank'); }

function showComments() {
    hideAll();
    document.getElementById('view-comments').classList.remove('hidden');
    document.getElementById('page-title').innerText = "Reviews";
    loadComments();
}

function postComment() {
    const name = document.getElementById('userName').value;
    const text = document.getElementById('userComment').value;
    if(!name || !text) return alert("Fill Name and Comment!");
    db.ref('padhai/comments').push({ name, comment: text }).then(() => {
        document.getElementById('userName').value = '';
        document.getElementById('userComment').value = '';
    });
}

function loadComments() {
    db.ref('padhai/comments').on('value', s => {
        const data = s.val();
        let html = '';
        if(data) {
            Object.values(data).reverse().forEach(c => {
                html += `<div class="comment-display"><b>${c.name}</b><br><small>${c.comment}</small></div>`;
            });
        }
        document.getElementById('comments-list').innerHTML = html;
    });
}

function shareApp() { if(navigator.share) navigator.share({title:'PadhAI', url: window.location.href}); }