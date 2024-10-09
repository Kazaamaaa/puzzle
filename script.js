let draggedElement = null;
let dragCount = 0;

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

    // Touch Events untuk perangkat mobile
    pieces.forEach(piece => {
        piece.addEventListener('touchstart', (e) => {
            draggedElement = piece;
            piece.classList.add('dragging');
            e.preventDefault();
        });

        piece.addEventListener('touchend', (e) => {
            piece.classList.remove('dragging');
            draggedElement = null;
            dragCount++;
            checkDragCount();
        });

        piece.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.querySelector('.dragging');
            const containerRect = container.getBoundingClientRect();

            const x = touch.clientX - containerRect.left;
            const y = touch.clientY - containerRect.top;

            element.style.position = 'absolute';
            element.style.left = `${x - element.clientWidth / 2}px`;
            element.style.top = `${y - element.clientHeight / 2}px`;
        });
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
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        container.appendChild(pieces[j]);
    }
}

function autoSolve() {
    const container = document.getElementById('puzzle-container');
    const pieces = Array.from(container.children);

    pieces.sort((a, b) => {
        return parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1]);
    });

    pieces.forEach(piece => {
        container.appendChild(piece);
        piece.style.transition = 'transform 0.5s ease';
        piece.style.transform = 'translate(0, 0)';
    });

    showFireworks();
    document.getElementById('auto-solve-button').style.display = 'none';
    document.getElementById('message').style.display = 'none';
    dragCount = 0; // Reset jumlah drag
}

function checkDragCount() {
    if (dragCount === 10) {
        document.getElementById('auto-solve-button').style.display = 'block';
        document.getElementById('message').innerText = 'Capek ya sayangku, ini susun otomatis sayangku🤍🤍🤍🤍!';
        document.getElementById('message').style.display = 'block';
    }
}

function showFireworks() {
    const fireworks = new Fireworks(document.getElementById('fireworks-container'), {
        opacity: 0.8,
        acceleration: 1.05,
        friction: 0.98,
        gravity: 1.5,
        particles: 100,
        colors: ['#ff004d', '#ffbb00', '#5cbaff', '#00e600'],
    });

    fireworks.start();
    setTimeout(() => {
        fireworks.stop();
    }, 4000); // Hentikan setelah 4 detik
}

window.onload = function() {
    shufflePuzzle();
    addDragAndDropListeners();

    const autoSolveButton = document.getElementById('auto-solve-button');
    autoSolveButton.addEventListener('click', autoSolve);
};
