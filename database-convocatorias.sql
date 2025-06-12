-- Crear tabla de convocatorias para el sistema MAWI
-- Esta tabla almacena información sobre convocatorias de financiamiento

CREATE TABLE IF NOT EXISTS convocatorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre de la convocatoria',
    fecha_cierre DATE NOT NULL COMMENT 'Fecha límite de la convocatoria',
    sitio_web VARCHAR(500) NULL COMMENT 'URL del sitio web oficial',
    region VARCHAR(100) NOT NULL COMMENT 'Región geográfica',
    organizacion VARCHAR(255) NOT NULL COMMENT 'Organización que publica la convocatoria',
    pais VARCHAR(100) NOT NULL COMMENT 'País o zona geográfica',
    descripcion TEXT NOT NULL COMMENT 'Descripción detallada de la convocatoria',
    monto VARCHAR(100) NULL COMMENT 'Monto del financiamiento disponible',
    usuario_id INT NOT NULL COMMENT 'ID del usuario que creó la convocatoria',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
    
    -- Índices para mejorar el rendimiento
    INDEX idx_fecha_cierre (fecha_cierre),
    INDEX idx_organizacion (organizacion),
    INDEX idx_region (region),
    INDEX idx_pais (pais),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_fecha_creacion (fecha_creacion),
    
    -- Índice de texto completo para búsquedas
    FULLTEXT INDEX ft_search (nombre, descripcion, organizacion),
    
    -- Clave foránea para vincular con la tabla de usuarios
    FOREIGN KEY (usuario_id) REFERENCES user(idUsuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de convocatorias del sistema MAWI';

-- Insertar algunos datos de ejemplo
INSERT INTO convocatorias (
    nombre, fecha_cierre, sitio_web, region, organizacion, pais, descripcion, monto, usuario_id
) VALUES 
(
    'Fondo Nacional de Innovación 2025',
    '2025-08-15',
    'https://innovacion.gob.mx',
    'América Latina',
    'Gobierno de México',
    'México',
    'Convocatoria para proyectos de innovación tecnológica y desarrollo sostenible dirigida a startups y empresas mexicanas con enfoque en soluciones ambientales.',
    '$2,000,000 MXN',
    1
),
(
    'Programa Horizonte Europa - Green Deal',
    '2025-06-01',
    'https://ec.europa.eu/horizoneurope',
    'Europa',
    'Comisión Europea',
    'Unión Europea',
    'Financiamiento para proyectos de investigación e innovación relacionados con el Pacto Verde Europeo y sostenibilidad ambiental.',
    '€50,000,000',
    1
),
(
    'Fondos de Conservación Marina',
    '2025-07-30',
    'https://oceanconservancy.org',
    'Global',
    'Ocean Conservancy',
    'Internacional',
    'Programa de financiamiento para proyectos de conservación marina y protección de ecosistemas costeros.',
    '$500,000 USD',
    1
),
(
    'Iniciativa de Biodiversidad Amazónica',
    '2025-05-20',
    'https://amazon-biodiversity.org',
    'América del Sur',
    'Fundación Amazon Conservation',
    'Brasil, Perú, Colombia',
    'Apoyo financiero para proyectos de investigación y conservación de la biodiversidad en la región amazónica.',
    '$1,500,000 USD',
    1
),
(
    'Programa de Energías Renovables LATAM',
    '2025-09-15',
    'https://renewable-latam.org',
    'América Latina',
    'BID - Banco Interamericano de Desarrollo',
    'América Latina y el Caribe',
    'Financiamiento para proyectos de desarrollo e implementación de tecnologías de energías renovables en la región.',
    '$10,000,000 USD',
    1
);

-- Crear vista para obtener convocatorias con estado calculado
CREATE VIEW v_convocatorias_con_estado AS
SELECT 
    id,
    nombre,
    fecha_cierre,
    sitio_web,
    region,
    organizacion,
    pais,
    descripcion,
    monto,
    usuario_id,
    fecha_creacion,
    fecha_actualizacion,
    CASE 
        WHEN fecha_cierre >= CURDATE() THEN 'abierta'
        ELSE 'cerrada'
    END as estado,
    DATEDIFF(fecha_cierre, CURDATE()) as dias_restantes
FROM convocatorias;

-- Crear procedimiento almacenado para obtener estadísticas
DELIMITER //
CREATE PROCEDURE sp_obtener_estadisticas_convocatorias()
BEGIN
    SELECT 
        COUNT(*) as total_convocatorias,
        SUM(CASE WHEN fecha_cierre >= CURDATE() THEN 1 ELSE 0 END) as convocatorias_abiertas,
        SUM(CASE WHEN fecha_cierre < CURDATE() THEN 1 ELSE 0 END) as convocatorias_cerradas,
        COUNT(DISTINCT organizacion) as organizaciones_unicas,
        COUNT(DISTINCT pais) as paises_unicos,
        AVG(DATEDIFF(fecha_cierre, fecha_creacion)) as promedio_dias_publicacion
    FROM convocatorias;
END //
DELIMITER ;

-- Crear trigger para log de cambios (opcional)
CREATE TABLE IF NOT EXISTS convocatorias_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    convocatoria_id INT NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    usuario_id INT NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datos_anteriores JSON NULL,
    datos_nuevos JSON NULL
);

DELIMITER //
CREATE TRIGGER tr_convocatorias_after_update
AFTER UPDATE ON convocatorias
FOR EACH ROW
BEGIN
    INSERT INTO convocatorias_log (
        convocatoria_id, 
        accion, 
        usuario_id, 
        datos_anteriores, 
        datos_nuevos
    ) VALUES (
        NEW.id,
        'UPDATE',
        NEW.usuario_id,
        JSON_OBJECT(
            'nombre', OLD.nombre,
            'fecha_cierre', OLD.fecha_cierre,
            'organizacion', OLD.organizacion,
            'descripcion', OLD.descripcion
        ),
        JSON_OBJECT(
            'nombre', NEW.nombre,
            'fecha_cierre', NEW.fecha_cierre,
            'organizacion', NEW.organizacion,
            'descripcion', NEW.descripcion
        )
    );
END //
DELIMITER ;
