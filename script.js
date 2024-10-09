let draggedElement = null;
let emptyPiece = null; // Menyimpan potongan kosong
let dragCount = 0; // Variabel untuk menghitung jumlah drag

function addDragAndDropListeners() {
    const pieces = document.querySelectorAll('.puzzle-piece');

    pieces.forEach(piece => {
        piece.setAttribute('draggable', 'true');

        piece.addEventListener('dragstart', (e) => {
            draggedElement = piece;
            piece.classList.add('dragging');
        });

        piece.addEventListener('dragend', (e) => {
            piece.classList.remove('dragging');
            draggedElement = null;

            dragCount++;
            checkDragCount();
        });
    });

    const container = document.getElementById('puzzle-container');
    container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            container.appendChild(dragging);
        } else {
            container.insertBefore(dragging, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.puzzle-piece:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function shufflePuzzle() {
    const container = document.getElementById('puzzle-container');
    const pieces = Array.from(container.children);
    
    // Acak posisi potongan puzzle
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        container.appendChild(pieces[j]);
    }

    emptyPiece = pieces.find(piece => piece.id === 'piece-16'); // Mengasumsikan potongan kosong adalah potongan 16
}

function autoSolve() {
    const container = document.getElementById('puzzle-container');
    const pieces = Array.from(container.children);

    // Urutkan kembali elemen sesuai ID
    pieces.sort((a, b) => {
        return parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]);
    });

    // Masukkan kembali elemen ke dalam container dalam urutan yang benar
    pieces.forEach(piece => {
        container.appendChild(piece);
        piece.style.transition = 'transform 0.5s ease';
        piece.style.transform = 'translate(0, 0)';
    });

    // Menampilkan efek kembang api
    showFireworks();

    document.getElementById('auto-solve-button').style.display = 'none';
    document.getElementById('message').style.display = 'none';

    dragCount = 0; // Reset jumlah drag
    showAutoSolveButton();
    document.getElementById('reset-button').style.display = 'block'; // Tampilkan tombol reset
}

function checkDragCount() {
    if (dragCount === 10) {
        document.getElementById('auto-solve-button').style.display = 'block';
        document.getElementById('message').innerText = 'Capek ya sayangku, ini susun otomatis sayangku🤍🤍🤍🤍!';
        document.getElementById('message').style.display = 'block';
    }
}

function showAutoSolveButton() {
    const autoSolveButton = document.getElementById('auto-solve-button');
    autoSolveButton.style.display = 'block';
}

function showFireworks() {
    const fireworks = new Fireworks(document.getElementById('fireworks-container'), { // Menggunakan container kembang api
        opacity: 0.8,
        acceleration: 1.05,
        friction: 0.98,
        gravity: 1.5,
        particles: 100,
        colors: ['#ff004d', '#ffbb00', '#5cbaff', '#00e600'],
    });
    
    fireworks.start();

    // Hentikan efek setelah beberapa detik
    setTimeout(() => {
        fireworks.stop();
    }, 4000); // Hentikan setelah 4 detik
}

// Fungsi untuk mereset puzzle
function resetPuzzle() {
    shufflePuzzle(); // Panggil fungsi untuk mengacak ulang puzzle
    dragCount = 0; // Reset jumlah drag
    checkDragCount(); // Cek jumlah drag untuk memperbarui tampilan
    document.getElementById('auto-solve-button').style.display = 'none'; // Sembunyikan tombol auto-solve
    document.getElementById('message').style.display = 'none'; // Sembunyikan pesan
}

// Tambahkan event listener untuk tombol reset
document.getElementById('reset-button').addEventListener('click', resetPuzzle);

function addTouchListeners() {
    const pieces = document.querySelectorAll('.puzzle-piece');

    pieces.forEach(piece => {
        piece.addEventListener('touchstart', (e) => {
            draggedElement = piece;
            piece.classList.add('dragging');
        });

        piece.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Mencegah scroll saat drag
            if (draggedElement) {
                const touch = e.touches[0];
                const rect = draggedElement.getBoundingClientRect();

                // Menggerakkan elemen mengikuti posisi sentuhan
                draggedElement.style.position = 'absolute';
                draggedElement.style.left = `${touch.clientX - rect.width / 2}px`;
                draggedElement.style.top = `${touch.clientY - rect.height / 2}px`;
            }
        });

        piece.addEventListener('touchend', (e) => {
            if (draggedElement) {
                const container = document.getElementById('puzzle-container');
                const containerRect = container.getBoundingClientRect();
                const draggedRect = draggedElement.getBoundingClientRect();

                // Memastikan elemen tetap dalam area container puzzle
                if (
                    draggedRect.top >= containerRect.top &&
                    draggedRect.left >= containerRect.left &&
                    draggedRect.bottom <= containerRect.bottom &&
                    draggedRect.right <= containerRect.right
                ) {
                    // Mengatur ulang posisi draggedElement agar kembali ke posisi layout normal
                    draggedElement.style.position = 'relative';
                    draggedElement.style.left = '0px';
                    draggedElement.style.top = '0px';

                    const afterElement = getDragAfterElement(container, e.changedTouches[0].clientY);
                    if (afterElement == null) {
                        container.appendChild(draggedElement);
                    } else {
                        container.insertBefore(draggedElement, afterElement);
                    }
                } else {
                    // Kembali ke posisi awal jika di luar container
                    draggedElement.style.position = 'static';
                }

                draggedElement.classList.remove('dragging');
                draggedElement = null;

                dragCount++;
                checkDragCount();
            }
        });
    });
}
// Fungsi untuk mengecek apakah potongan puzzle bisa bergerak
function canMove(draggedRect, emptyRect) {
    const isAdjacent =
        (draggedRect.left === emptyRect.right || draggedRect.right === emptyRect.left) &&
        (draggedRect.top === emptyRect.top || draggedRect.bottom === emptyRect.top ||
         draggedRect.top === emptyRect.bottom);
    return isAdjacent;
}

window.onload = function() {
    shufflePuzzle();
    addDragAndDropListeners();
    addTouchListeners(); // Tambahkan event listener untuk swipe

    const autoSolveButton = document.getElementById('auto-solve-button');
    autoSolveButton.addEventListener('click', autoSolve);
};
