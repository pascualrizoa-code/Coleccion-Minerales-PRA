let mineralsData = [];
let filteredData = [];

// DOM Elements
const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const filterClase = document.getElementById('filterClase');
const filterSistema = document.getElementById('filterSistema');
const filterPais = document.getElementById('filterPais');
const stats = document.getElementById('stats');
const modal = document.getElementById('modal');
const modalClose = document.querySelector('.modal-close');
const kioskBtn = document.getElementById('kioskBtn');
const fs = document.getElementById('fullscreen');
const fsImg = document.getElementById('fullscreenImg');

let zoomScale = 1;
let zoomPos = { x: 0, y: 0 };
let isDragging = false;
let startDrag = { x: 0, y: 0 };

let kioskTimer = null;
let kioskIndex = 0;
const KIOSK_INTERVAL = 8000; // 8 segundos por mineral

// Load Data
async function init() {
    try {
        const response = await fetch('catalogo_minerales.json');
        mineralsData = await response.json();
        filteredData = [...mineralsData];

        populateFilters();
        renderGrid();
        updateStats();

        // Dinamically set the current year
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Event Listeners
        searchInput.addEventListener('input', handleFilters);
        filterClase.addEventListener('change', handleFilters);
        filterSistema.addEventListener('change', handleFilters);
        filterPais.addEventListener('change', handleFilters);
        modalClose.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

        kioskBtn.addEventListener('click', toggleKioskMode);
    } catch (error) {
        console.error('Error cargando los datos:', error);
        stats.textContent = 'Error al cargar la colección.';
    }
}

function populateFilters() {
    const clases = [...new Set(mineralsData.map(m => m["Clase química"]).filter(Boolean))].sort();
    const sistemas = [...new Set(mineralsData.map(m => m["Sistema cristalino"]).filter(Boolean))].sort();
    const paises = [...new Set(mineralsData.map(m => m["Pais"]).filter(Boolean))].sort();

    clases.forEach(c => filterClase.appendChild(new Option(c, c)));
    sistemas.forEach(s => filterSistema.appendChild(new Option(s, s)));
    paises.forEach(p => filterPais.appendChild(new Option(p, p)));
}

function renderGrid() {
    grid.innerHTML = '';
    filteredData.forEach(mineral => {
        const id = mineral["Nº Inventario"];
        const card = document.createElement('div');
        card.className = 'mineral-card';
        card.innerHTML = `
            <span class="inventory-tag">${id}</span>
            <img class="card-image" src="imagenes/${id}/1.jpg" onerror="this.src='https://via.placeholder.com/400x300?text=Sin+Imagen'" alt="${mineral.Mineral}">
            <div class="card-info">
                <h3>${mineral.Mineral}</h3>
                <span class="formula">${mineral["Fórmula química"] || ''}</span>
                <div class="card-meta">
                    <span><strong>Origen:</strong> ${mineral.Yacimiento || mineral.Pais}</span>
                    <span><strong>Clase:</strong> ${mineral["Clase química"]}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => openModal(mineral));
        grid.appendChild(card);
    });
}

function handleFilters() {
    const query = searchInput.value.toLowerCase();
    const clase = filterClase.value;
    const sistema = filterSistema.value;
    const pais = filterPais.value;

    filteredData = mineralsData.filter(m => {
        const matchesSearch =
            m.Mineral.toLowerCase().includes(query) ||
            (m.Yacimiento && m.Yacimiento.toLowerCase().includes(query)) ||
            (m.Pais && m.Pais.toLowerCase().includes(query)) ||
            (m["Nº Inventario"] && m["Nº Inventario"].toLowerCase().includes(query));

        const matchesClase = !clase || m["Clase química"] === clase;
        const matchesSistema = !sistema || m["Sistema cristalino"] === sistema;
        const matchesPais = !pais || m["Pais"] === pais;

        return matchesSearch && matchesClase && matchesSistema && matchesPais;
    });

    renderGrid();
    updateStats();
}

function updateStats() {
    stats.textContent = `Mostrando ${filteredData.length} de ${mineralsData.length} ejemplares`;
}

function openModal(mineral) {
    const id = mineral["Nº Inventario"];
    document.getElementById('modalInventory').textContent = id;
    document.getElementById('modalTitle').textContent = mineral.Mineral;
    document.getElementById('modalFormula').textContent = mineral["Fórmula química"] || '';
    document.getElementById('modalNotes').textContent = mineral.Notas || 'Sin notas adicionales.';

    const ficha = document.getElementById('modalFicha');
    ficha.innerHTML = `
        <div class="detail-item"><h4>Variedad</h4><p>${mineral.Variedad || '-'}</p></div>
        <div class="detail-item"><h4>Hábito</h4><p>${mineral["Hábito / Morfología"] || '-'}</p></div>
        <div class="detail-item"><h4>Yacimiento</h4><p>${mineral.Yacimiento || '-'}</p></div>
        <div class="detail-item"><h4>País</h4><p>${mineral.Pais || '-'}</p></div>
        <div class="detail-item"><h4>Dimensiones</h4><p>${mineral["Dimensiones (mm)"] || '-'}</p></div>
        <div class="detail-item"><h4>Peso</h4><p>${mineral["Peso (Gramos)"] ? mineral["Peso (Gramos)"] + ' g' : '-'}</p></div>
        <div class="detail-item"><h4>Color</h4><p>${mineral.Color || '-'}</p></div>
        <div class="detail-item"><h4>Brillo</h4><p>${mineral.Brillo || '-'}</p></div>
    `;

    // Gallery Logic
    const mainImg = document.getElementById('modalMainImg');
    const thumbs = document.getElementById('modalThumbs');
    thumbs.innerHTML = '';

    mainImg.src = `imagenes/${id}/1.jpg`;
    mainImg.onerror = () => { mainImg.src = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible'; };

    // Try to load up to 4 images and maintain order
    const loadThumbs = async () => {
        const thumbPromises = [];
        for (let i = 1; i <= 4; i++) {
            const imgPath = `imagenes/${id}/${i}.jpg`;
            thumbPromises.push(new Promise((resolve) => {
                const tempImg = new Image();
                tempImg.onload = () => resolve({ path: imgPath, index: i });
                tempImg.onerror = () => resolve(null);
                tempImg.src = imgPath;
            }));
        }

        const loadedThumbs = (await Promise.all(thumbPromises)).filter(t => t !== null);

        loadedThumbs.forEach((t, idx) => {
            const thumb = document.createElement('img');
            thumb.src = t.path;
            thumb.alt = `Vista ${t.index}`;
            if (t.index === 1) thumb.classList.add('active');

            thumb.addEventListener('click', () => {
                mainImg.src = t.path;
                thumbs.querySelectorAll('img').forEach(img => img.classList.remove('active'));
                thumb.classList.add('active');
            });
            thumbs.appendChild(thumb);
        });
    };
    loadThumbs();

    modal.style.display = 'flex';

    // Fullscreen event
    mainImg.onclick = () => {
        fsImg.src = mainImg.src;
        fs.style.display = 'flex';
        resetZoom();
    };
}

// Fullscreen Viewer Logic
function resetZoom() {
    zoomScale = 1;
    zoomPos = { x: 0, y: 0 };
    updateImageTransform();
}

function updateImageTransform() {
    fsImg.style.transform = `translate(${zoomPos.x}px, ${zoomPos.y}px) scale(${zoomScale})`;
}

// Fullscreen close
const closeFullscreen = () => {
    fs.style.display = 'none';
};
document.querySelector('.fullscreen-close').onclick = closeFullscreen;

// Zoom logic
fs.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = zoomScale * delta;
    if (newScale >= 0.5 && newScale <= 10) {
        zoomScale = newScale;
        updateImageTransform();
    }
}, { passive: false });

// Drag logic
fsImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startDrag = { x: e.clientX - zoomPos.x, y: e.clientY - zoomPos.y };
    fsImg.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    zoomPos.x = e.clientX - startDrag.x;
    zoomPos.y = e.clientY - startDrag.y;
    updateImageTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    fsImg.style.cursor = 'grab';
});

fsImg.addEventListener('dblclick', resetZoom);

// Kiosk Mode Logic
function toggleKioskMode() {
    const isKiosk = document.body.classList.toggle('kiosk');
    if (isKiosk) {
        kioskBtn.textContent = 'Salir Modo Exposición';
        startKiosk();
    } else {
        kioskBtn.textContent = 'Modo Exposición';
        stopKiosk();
    }
}

function startKiosk() {
    if (filteredData.length === 0) return;
    kioskIndex = 0;
    // Cerrar cualquier modal previo
    modal.style.display = 'none';

    // Iniciar rotación
    rotateKiosk();
    kioskTimer = setInterval(rotateKiosk, KIOSK_INTERVAL);
}

function stopKiosk() {
    clearInterval(kioskTimer);
    kioskTimer = null;
    modal.style.display = 'none';
}

function rotateKiosk() {
    if (filteredData.length === 0) {
        stopKiosk();
        return;
    }

    // Animación suave al cambiar
    modal.style.opacity = '0';
    setTimeout(() => {
        openModal(filteredData[kioskIndex]);
        modal.style.opacity = '1';
        kioskIndex = (kioskIndex + 1) % filteredData.length;
    }, 400);
}

// Execute Init
init();
