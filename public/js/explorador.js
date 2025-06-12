// Explorador de Anteproyectos - Frontend Only
class ExploradorManager {
    constructor() {
        this.anteproyectos = this.loadAnteproyectos();
        this.currentTab = 'abiertos';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderAnteproyectos();
        this.loadSampleData();
    }

    bindEvents() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach((btn, idx) => {
            btn.addEventListener('click', (e) => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTab = idx === 0 ? 'abiertos' : 'cerrados';
                this.renderAnteproyectos();
            });
        });
    }

    loadAnteproyectos() {
        const saved = localStorage.getItem('mawi_anteproyectos');
        return saved ? JSON.parse(saved) : [];
    }

    saveAnteproyectos() {
        localStorage.setItem('mawi_anteproyectos', JSON.stringify(this.anteproyectos));
    }

    loadSampleData() {
        if (this.anteproyectos.length === 0) {
            const sampleData = [
                {
                    id: 1,
                    titulo: 'Sistema de Riego Inteligente',
                    descripcion: 'Proyecto de IoT para optimizar el uso de agua en agricultura.',
                    fechaCreacion: '2025-06-01',
                    fechaLimite: '2025-12-31',
                    estado: 'abierto'
                },
                {
                    id: 2,
                    titulo: 'Plataforma de Telemedicina',
                    descripcion: 'Solución digital para consultas médicas remotas.',
                    fechaCreacion: '2025-01-15',
                    fechaLimite: '2025-05-30',
                    estado: 'cerrado'
                }
            ];
            this.anteproyectos = sampleData;
            this.saveAnteproyectos();
            this.renderAnteproyectos();
        }
    }    renderAnteproyectos() {
        const container = document.querySelector('.projects-container');
        if (!container) return;
        container.innerHTML = '';
        const filtered = this.anteproyectos.filter(p =>
            this.currentTab === 'abiertos' ? p.estado === 'abierto' : p.estado === 'cerrado'
        );
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-msg">No hay anteproyectos en esta categoría.</div>';
            return;
        }
        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-content">
                    <h3 class="project-title">${p.titulo}</h3>
                    <p class="project-description">${p.descripcion}</p>
                    <div class="project-dates">
                        <span class="date-label">Fecha de creación: </span>
                        <span class="date">${p.fechaCreacion}</span>
                        <span class="date-label">Fecha límite: </span>
                        <span class="date">${p.fechaLimite}</span>
                    </div>
                </div>
                <div class="project-action">
                    <button class="circle-btn view-pdf-btn" data-id="${p.id}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5V19M5 12H19" stroke="#30a046" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
        
        // Asignar eventos a los botones de ver PDF
        document.querySelectorAll('.view-pdf-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                this.loadPdf(id);
                // Opcional: marcar este proyecto como activo visualmente
                document.querySelectorAll('.project-card').forEach(card => {
                    card.classList.remove('active');
                });
                btn.closest('.project-card').classList.add('active');
            });
        });
    }
    
    init() {
        this.bindEvents();
        this.setupSplitView();
        this.renderAnteproyectos();
        this.loadSampleData();
    }
    
    setupSplitView() {
        const resizer = document.getElementById('side-resizer');
        const projectsSide = document.getElementById('projects-side');
        const toggleBtn = document.getElementById('toggle-pdf-btn');
        
        if (!resizer || !projectsSide || !toggleBtn) return;
        
        // Configurar resizer
        let startX, startWidth;
        
        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            startWidth = projectsSide.getBoundingClientRect().width;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });
        
        const resize = (e) => {
            const width = startWidth + (e.clientX - startX);
            const containerWidth = document.querySelector('.split-view').getBoundingClientRect().width;
            const percentWidth = (width / containerWidth) * 100;
            
            if (percentWidth > 20 && percentWidth < 80) {
                projectsSide.style.width = `${percentWidth}%`;
                resizer.style.left = `${percentWidth}%`;
            }
        };
        
        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        };
        
        // Configurar botón toggle
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = projectsSide.classList.toggle('collapsed');
            toggleBtn.textContent = isCollapsed ? 'Mostrar lista' : 'Ocultar lista';
        });
    }// Función para cargar el PDF integrado en la página
    loadPdf(id) {
        // Mock: asignar un PDF diferente por id, en real sería una URL del backend
        const pdfMap = {
            1: 'mock-pdfs/anteproyecto1.pdf',
            2: 'mock-pdfs/anteproyecto2.pdf'
        };
        const pdfUrl = pdfMap[id] || 'mock-pdfs/demo.pdf';
        const iframe = document.getElementById('pdfViewer');
        if (iframe) iframe.src = pdfUrl;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new ExploradorManager();
});
