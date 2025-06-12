// Gestión de Convocatorias - Frontend Only
class ConvocatoriasManager {
    constructor() {
        this.convocatorias = this.loadConvocatorias();
        this.currentFilter = 'todas';
        this.currentSearch = '';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderConvocatorias();
        this.loadSampleData();
    }

    bindEvents() {
        // Modal events
        const addBtn = document.getElementById('addConvocatoriaBtn');
        const modal = document.getElementById('convocatoriaModal');
        const closeBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('convocatoriaForm');

        if (addBtn) addBtn.addEventListener('click', () => this.openModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Filter events
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Search events
        const searchInput = document.getElementById('search-convocatorias');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Close modal on overlay click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    }

    loadConvocatorias() {
        const saved = localStorage.getItem('mawi_convocatorias');
        return saved ? JSON.parse(saved) : [];
    }

    saveConvocatorias() {
        localStorage.setItem('mawi_convocatorias', JSON.stringify(this.convocatorias));
    }

    loadSampleData() {
        if (this.convocatorias.length === 0) {
            const sampleData = [
                {
                    id: 1,
                    name: 'Convocatoria de Innovación Tecnológica 2025',
                    fechaCierre: '2025-12-31',
                    sitioWeb: 'https://innovacion.gob.mx',
                    region: 'Región Centro',
                    organizacion: 'CONACYT',
                    pais: 'México',
                    descripcion: 'Convocatoria para proyectos de innovación tecnológica que impulsen el desarrollo sostenible y la competitividad nacional.',
                    monto: '$500,000 MXN',
                    fechaCreacion: '2025-06-01'
                },
                {
                    id: 2,
                    name: 'Programa de Apoyo a Startups',
                    fechaCierre: '2025-08-15',
                    sitioWeb: 'https://startups.org',
                    region: 'Nacional',
                    organizacion: 'Fondo de Emprendimiento',
                    pais: 'México',
                    descripcion: 'Apoyo financiero y mentorías para startups en etapas tempranas con enfoque en tecnología.',
                    monto: '$200,000 MXN',
                    fechaCreacion: '2025-05-15'
                },
                {
                    id: 3,
                    name: 'Convocatoria Medio Ambiente 2025',
                    fechaCierre: '2025-07-01',
                    sitioWeb: 'https://medioambiente.org',
                    region: 'Región Sur',
                    organizacion: 'Fundación Verde',
                    pais: 'México',
                    descripcion: 'Proyectos enfocados en la conservación del medio ambiente y desarrollo sustentable.',
                    monto: '$300,000 MXN',
                    fechaCreacion: '2025-04-20'
                }
            ];
            
            this.convocatorias = sampleData;
            this.saveConvocatorias();
        }
    }

    openModal(convocatoria = null) {
        const modal = document.getElementById('convocatoriaModal');
        const title = document.getElementById('modalTitle');
        const submitText = document.getElementById('submitBtnText');
        
        if (convocatoria) {
            this.editingId = convocatoria.id;
            title.textContent = 'Editar Convocatoria';
            submitText.textContent = 'Actualizar Convocatoria';
            this.fillForm(convocatoria);
        } else {
            this.editingId = null;
            title.textContent = 'Nueva Convocatoria';
            submitText.textContent = 'Guardar Convocatoria';
            this.clearForm();
        }
        
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('convocatoriaModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.clearForm();
        this.editingId = null;
    }

    fillForm(convocatoria) {
        document.getElementById('convocatoria-name').value = convocatoria.name || '';
        document.getElementById('fecha-cierre').value = convocatoria.fechaCierre || '';
        document.getElementById('sitio-web').value = convocatoria.sitioWeb || '';
        document.getElementById('region').value = convocatoria.region || '';
        document.getElementById('organizacion').value = convocatoria.organizacion || '';
        document.getElementById('pais').value = convocatoria.pais || '';
        document.getElementById('descripcion').value = convocatoria.descripcion || '';
        document.getElementById('monto').value = convocatoria.monto || '';
    }

    clearForm() {
        const form = document.getElementById('convocatoriaForm');
        if (form) form.reset();
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('convocatoria-name').value.trim(),
            fechaCierre: document.getElementById('fecha-cierre').value,
            sitioWeb: document.getElementById('sitio-web').value.trim(),
            region: document.getElementById('region').value.trim(),
            organizacion: document.getElementById('organizacion').value.trim(),
            pais: document.getElementById('pais').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            monto: document.getElementById('monto').value.trim()
        };

        if (!formData.name || !formData.fechaCierre || !formData.region || 
            !formData.organizacion || !formData.pais || !formData.descripcion) {
            alert('Por favor, completa todos los campos obligatorios.');
            return;
        }

        if (this.editingId) {
            this.updateConvocatoria(formData);
        } else {
            this.createConvocatoria(formData);
        }
    }

    createConvocatoria(data) {
        const newConvocatoria = {
            id: Date.now(),
            ...data,
            fechaCreacion: new Date().toISOString().split('T')[0]
        };

        this.convocatorias.unshift(newConvocatoria);
        this.saveConvocatorias();
        this.renderConvocatorias();
        this.closeModal();
        this.showNotification('Convocatoria creada exitosamente', 'success');
    }

    updateConvocatoria(data) {
        const index = this.convocatorias.findIndex(c => c.id === this.editingId);
        if (index !== -1) {
            this.convocatorias[index] = { ...this.convocatorias[index], ...data };
            this.saveConvocatorias();
            this.renderConvocatorias();
            this.closeModal();
            this.showNotification('Convocatoria actualizada exitosamente', 'success');
        }
    }

    deleteConvocatoria(id) {
        if (confirm('¿Estás seguro de que deseas eliminar esta convocatoria?')) {
            this.convocatorias = this.convocatorias.filter(c => c.id !== id);
            this.saveConvocatorias();
            this.renderConvocatorias();
            this.showNotification('Convocatoria eliminada exitosamente', 'success');
        }
    }

    handleFilter(e) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.renderConvocatorias();
    }

    handleSearch(e) {
        this.currentSearch = e.target.value.toLowerCase();
        this.renderConvocatorias();
    }

    filterConvocatorias() {
        let filtered = [...this.convocatorias];

        // Apply search filter
        if (this.currentSearch) {
            filtered = filtered.filter(convocatoria =>
                convocatoria.name.toLowerCase().includes(this.currentSearch) ||
                convocatoria.organizacion.toLowerCase().includes(this.currentSearch) ||
                convocatoria.region.toLowerCase().includes(this.currentSearch) ||
                convocatoria.pais.toLowerCase().includes(this.currentSearch)
            );
        }

        // Apply status filter
        if (this.currentFilter !== 'todas') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(convocatoria => {
                const isOpen = convocatoria.fechaCierre >= today;
                return this.currentFilter === 'abiertas' ? isOpen : !isOpen;
            });
        }

        return filtered;
    }

    renderConvocatorias() {
        const container = document.getElementById('convocatoriasList');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;

        const filtered = this.filterConvocatorias();

        if (filtered.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        container.innerHTML = filtered.map(convocatoria => this.createConvocatoriaCard(convocatoria)).join('');
    }

    createConvocatoriaCard(convocatoria) {
        const today = new Date().toISOString().split('T')[0];
        const isOpen = convocatoria.fechaCierre >= today;
        const statusClass = isOpen ? 'status-open' : 'status-closed';
        const statusText = isOpen ? 'Abierta' : 'Cerrada';

        return `
            <div class="convocatoria-card">
                <div class="card-header">
                    <h3 class="convocatoria-title">${convocatoria.name}</h3>
                    <div class="card-actions">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <button class="action-btn edit-btn" onclick="convocatoriasManager.openModal(${JSON.stringify(convocatoria).replace(/"/g, '&quot;')})" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                                <path d="m18.5 2.5 a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <button class="action-btn delete-btn" onclick="convocatoriasManager.deleteConvocatoria(${convocatoria.id})" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <polyline points="3,6 5,6 21,6" stroke="currentColor" stroke-width="2"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="convocatoria-info">
                        <div class="info-item">
                            <span class="info-label">Organización:</span>
                            <span class="info-value">${convocatoria.organizacion}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Región:</span>
                            <span class="info-value">${convocatoria.region}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">País:</span>
                            <span class="info-value">${convocatoria.pais}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha de cierre:</span>
                            <span class="info-value">${this.formatDate(convocatoria.fechaCierre)}</span>
                        </div>
                        ${convocatoria.monto ? `
                        <div class="info-item">
                            <span class="info-label">Monto:</span>
                            <span class="info-value">${convocatoria.monto}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <p class="convocatoria-description">${convocatoria.descripcion}</p>
                    
                    ${convocatoria.sitioWeb ? `
                    <div class="card-footer">
                        <a href="${convocatoria.sitioWeb}" target="_blank" class="website-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2"/>
                                <polyline points="15,3 21,3 21,9" stroke="currentColor" stroke-width="2"/>
                                <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Ver sitio web
                        </a>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
let convocatoriasManager;
document.addEventListener('DOMContentLoaded', function() {
    convocatoriasManager = new ConvocatoriasManager();
});
