// ===== CONFIGURACIÓN DE URLs =====

// Registrar plugin de datalabels globalmente
if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
    Chart.register(ChartDataLabels);
}

const SHEET_ID = '1I6eGs9L4vICNaIAxr2yJi7953ch6fUyIRV-G-EHdI78';
const URL_TABLA1 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=863156308&range=A1:DW34`;
const URL_TABLA_ACUMULADOS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=863156308&range=A37:DW70`;
const URL_TABLA_SIN_FOSAS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=863156308&range=A173:N206`;
const URL_TABLA_CON_FOSAS = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=863156308&range=A137:N170`;

// ===== MAPEO DE IDs DEL SVG A NOMBRES DE ESTADOS =====
const ID_SVG_A_NOMBRE = {
    'MXAGU': 'Aguascalientes',
    'MXBCN': 'Baja California',
    'MXBCS': 'Baja California Sur',
    'MXCAM': 'Campeche',
    'MXCOA': 'Coahuila',
    'MXCOL': 'Colima',
    'MXCHP': 'Chiapas',
    'MXCHH': 'Chihuahua',
    'MXCMX': 'Ciudad de México',
    'MXDUR': 'Durango',
    'MXGUA': 'Guanajuato',
    'MXGRO': 'Guerrero',
    'MXHID': 'Hidalgo',
    'MXJAL': 'Jalisco',
    'MXMEX': 'Estado de México',
    'MXMIC': 'Michoacán',
    'MXMOR': 'Morelos',
    'MXNAY': 'Nayarit',
    'MXNLE': 'Nuevo León',
    'MXOAX': 'Oaxaca',
    'MXPUE': 'Puebla',
    'MXQUE': 'Querétaro',
    'MXROO': 'Quintana Roo',
    'MXSLP': 'San Luis Potosí',
    'MXSIN': 'Sinaloa',
    'MXSON': 'Sonora',
    'MXTAB': 'Tabasco',
    'MXTAM': 'Tamaulipas',
    'MXTLA': 'Tlaxcala',
    'MXVER': 'Veracruz',
    'MXYUC': 'Yucatán',
    'MXZAC': 'Zacatecas'
};

// Coordenadas de centroides para etiquetas (capturadas con herramienta interactiva)
const CENTROIDES_ESTADOS = {
    'MXAGU': { x: 505, y: 375 },  // Aguascalientes
    'MXBCN': { x: 136, y: 114 },  // Baja California
    'MXBCS': { x: 237, y: 258 },  // Baja California Sur
    'MXCAM': { x: 851, y: 470 },  // Campeche
    'MXCOA': { x: 515, y: 201 },  // Coahuila
    'MXCOL': { x: 462, y: 464 },  // Colima
    'MXCHP': { x: 789, y: 543 },  // Chiapas
    'MXCHH': { x: 394, y: 149 },  // Chihuahua
    'MXCMX': { x: 597, y: 463 },  // Ciudad de México
    'MXDUR': { x: 423, y: 284 },  // Durango
    'MXGUA': { x: 543, y: 409 },  // Guanajuato
    'MXGRO': { x: 579, y: 507 },  // Guerrero
    'MXHID': { x: 598, y: 423 },  // Hidalgo
    'MXJAL': { x: 469, y: 425 },  // Jalisco
    'MXMEX': { x: 577, y: 455 },  // Estado de México
    'MXMIC': { x: 512, y: 465 },  // Michoacán
    'MXMOR': { x: 600, y: 474 },  // Morelos
    'MXNAY': { x: 430, y: 377 },  // Nayarit
    'MXNLE': { x: 576, y: 265 },  // Nuevo León
    'MXOAX': { x: 670, y: 536 },  // Oaxaca
    'MXPUE': { x: 631, y: 478 },  // Puebla
    'MXQUE': { x: 578, y: 411 },  // Querétaro
    'MXROO': { x: 912, y: 447 },  // Quintana Roo
    'MXSLP': { x: 560, y: 361 },  // San Luis Potosí
    'MXSIN': { x: 361, y: 288 },  // Sinaloa
    'MXSON': { x: 267, y: 128 },  // Sonora
    'MXTAB': { x: 782, y: 497 },  // Tabasco
    'MXTAM': { x: 614, y: 303 },  // Tamaulipas
    'MXTLA': { x: 626, y: 456 },  // Tlaxcala
    'MXVER': { x: 670, y: 465 },  // Veracruz
    'MXYUC': { x: 886, y: 411 },  // Yucatán
    'MXZAC': { x: 488, y: 331 }   // Zacatecas
};

// Variables globales para el mapa nacional
let datosNacionales = [];
let datosAcumulados = []; // Datos acumulados del año 2026
let fechasDisponibles = [];
let indiceFechaActual = 0;
let ultimaFechaConDatos = ''; // Última fecha con datos en el Google Sheet

// ===== FUNCIÓN DE FORMATEO DE FECHAS =====

function formatearFechaParaArchivo(fechaTexto) {
    // Convierte fecha como "1/Diciembre/2025" o "1-dic" a "01-Dic-2025"
    const mesesMap = {
        'enero': 'Ene', 'febrero': 'Feb', 'marzo': 'Mar', 'abril': 'Abr',
        'mayo': 'May', 'junio': 'Jun', 'julio': 'Jul', 'agosto': 'Ago',
        'septiembre': 'Sep', 'octubre': 'Oct', 'noviembre': 'Nov', 'diciembre': 'Dic',
        'ene': 'Ene', 'feb': 'Feb', 'mar': 'Mar', 'abr': 'Abr',
        'may': 'May', 'jun': 'Jun', 'jul': 'Jul', 'ago': 'Ago',
        'sep': 'Sep', 'oct': 'Oct', 'nov': 'Nov', 'dic': 'Dic'
    };
    
    // Intentar parsear formato "1-dic" o "1/Diciembre/2025"
    let dia, mes, anio;
    
    if (fechaTexto.includes('/')) {
        // Formato: "1/Diciembre/2025"
        const partes = fechaTexto.split('/');
        if (partes.length !== 3) return fechaTexto;
        dia = partes[0].padStart(2, '0');
        mes = mesesMap[partes[1].toLowerCase()] || partes[1].substring(0, 3);
        mes = mes.charAt(0).toUpperCase() + mes.slice(1).toLowerCase();
        anio = partes[2];
    } else if (fechaTexto.includes('-')) {
        // Formato: "1-dic" (formato del CSV)
        const partes = fechaTexto.split('-');
        if (partes.length < 2) return fechaTexto;
        dia = partes[0].padStart(2, '0');
        mes = mesesMap[partes[1].toLowerCase()] || partes[1].substring(0, 3);
        mes = mes.charAt(0).toUpperCase() + mes.slice(1).toLowerCase();
        // Año fijo 2025 (igual que en formatearFecha)
        anio = '2025';
    } else {
        return fechaTexto;
    }
    
    return `${dia}-${mes}-${anio}`;
}

function obtenerUltimaFechaConDatos() {
    // Retorna la última fecha con datos reales (ya calculada en cargarDatosNacionales)
    if (!ultimaFechaConDatos) return '';
    return formatearFechaParaArchivo(ultimaFechaConDatos);
}

function actualizarTituloTablas() {
    // Actualiza el título de la sección de tablas con texto fijo
    const tituloElemento = document.getElementById('tituloTablasHomicidios');
    if (!tituloElemento) return;
    
    // Título fijo sin fecha dinámica
    tituloElemento.textContent = 'Homicidios Dolosos 2025';
}

// ===== INICIALIZACIÓN =====

async function inicializarMapaNacional() {
    try {
        console.log('Iniciando carga de mapa nacional...');
        
        // Cargar datos de Google Sheets
        await cargarDatosNacionales();
        await cargarDatosAcumulados();
        
        // Cargar SVG
        await cargarSVG();
        
        // Configurar controles
        configurarControlesNacionales();
        
        // Establecer fecha inicial como ayer
        establecerFechaInicial();
        
        // Actualizar mapa con fecha inicial
        actualizarMapaNacional();
        
        // Configurar popups
        configurarPopups();
        
        console.log('✓ Mapa nacional inicializado correctamente');
        
    } catch (error) {
        console.error('Error inicializando mapa nacional:', error);
    }
}

// ===== CARGA DE DATOS =====

async function cargarDatosNacionales() {
    try {
        const response = await fetch(URL_TABLA1);
        const csvText = await response.text();
        
        const lineas = csvText.split('\n');
        const encabezados = lineas[0].split(',');
        
        // Extraer fechas (columnas desde la B en adelante)
        // Columnas: A=Estado, B=1/01/2026, C=2/01/2026, D=3/01/2026, etc.
        fechasDisponibles = encabezados.slice(1).map(f => f.trim()).filter(f => f);
        
        // Procesar datos por estado
        datosNacionales = [];
        
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;
            
            const valores = linea.split(',');
            const estado = valores[0].trim();
            
            // Filtrar filas vacías, NACIONAL y Total
            if (estado && estado !== 'NACIONAL' && estado !== 'Total') {
                // Tomar desde columna B en adelante (todas las fechas diarias)
                const valoresNumericos = valores.slice(1).map(v => {
                    const num = parseInt(v);
                    return isNaN(num) ? 0 : num;
                });
                
                datosNacionales.push({
                    estado: estado,
                    valores: valoresNumericos
                });
            }
        }
        
        // Detectar última fecha con datos reales usando la fila "Total"
        let indiceFechaConDatos = -1;
        let filaTotalValores = [];
        
        // Buscar la fila "Total" en el CSV (probar varias variantes)
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;
            
            const valores = linea.split(',');
            const nombreFila = valores[0].trim().toLowerCase();
            
            // Buscar variantes de "Total"
            if (nombreFila === 'total' || nombreFila === 'total nacional' || nombreFila.includes('total')) {
                // Extraer valores de la fila Total (desde columna E en adelante)
                filaTotalValores = valores.slice(4).map(v => {
                    const num = parseInt(v);
                    return isNaN(num) ? 0 : num;
                });
                console.log(`✓ Fila Total encontrada: "${valores[0].trim()}" con ${filaTotalValores.length} valores`);
                break;
            }
        }
        
        // Buscar desde el final hacia atrás la primera columna con datos > 0 en Total
        if (filaTotalValores.length > 0) {
            for (let i = filaTotalValores.length - 1; i >= 0; i--) {
                if (filaTotalValores[i] > 0) {
                    indiceFechaConDatos = i;
                    console.log(`✓ Última columna con datos encontrada en índice ${i}, valor: ${filaTotalValores[i]}`);
                    break;
                }
            }
        } else {
            console.warn('⚠ No se encontró la fila Total en el CSV');
        }
        
        // Establecer última fecha con datos reales
        if (indiceFechaConDatos >= 0 && indiceFechaConDatos < fechasDisponibles.length) {
            ultimaFechaConDatos = fechasDisponibles[indiceFechaConDatos];
        } else {
            console.warn(`⚠ Índice de fecha inválido: ${indiceFechaConDatos}, usando fallback`);
            if (fechasDisponibles.length > 0) {
                // Fallback: usar la última fecha disponible
                ultimaFechaConDatos = fechasDisponibles[fechasDisponibles.length - 1];
                indiceFechaConDatos = fechasDisponibles.length - 1;
            }
        }
        
        console.log(`✓ Datos cargados: ${datosNacionales.length} estados, ${fechasDisponibles.length} fechas`);
        console.log(`✓ Última fecha con datos reales: "${ultimaFechaConDatos}" (índice ${indiceFechaConDatos})`);
        if (indiceFechaConDatos >= 0 && filaTotalValores[indiceFechaConDatos]) {
            console.log(`✓ Total de homicidios en última fecha: ${filaTotalValores[indiceFechaConDatos]}`);
        }
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

async function cargarDatosAcumulados() {
    try {
        const response = await fetch(URL_TABLA_ACUMULADOS);
        const csvText = await response.text();
        
        const lineas = csvText.split('\n');
        const encabezados = lineas[0].split(',');
        
        // Tabla Acumulados 2026 (filas 37-70)
        // Columnas: A=Estado, B=1/01/2026, C=2/01/2026, D=3/01/2026, etc.
        // Tomar desde columna B en adelante (todas las fechas)
        
        // Procesar datos por estado
        datosAcumulados = [];
        
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (!linea) continue;
            
            const valores = linea.split(',');
            const estado = valores[0].trim();
            
            // Filtrar filas vacías, NACIONAL y Total
            if (estado && estado !== 'NACIONAL' && estado !== 'Total') {
                // Tomar desde columna B en adelante (todas las fechas diarias acumuladas)
                const valoresNumericos = valores.slice(1).map(v => {
                    const num = parseInt(v);
                    return isNaN(num) ? 0 : num;
                });
                
                datosAcumulados.push({
                    estado: estado,
                    valores: valoresNumericos
                });
            }
        }
        
        console.log(`✓ Datos acumulados cargados: ${datosAcumulados.length} estados`);
        
    } catch (error) {
        console.error('Error cargando datos acumulados:', error);
    }
}

// ===== CARGA DEL SVG =====

async function cargarSVG() {
    try {
        const response = await fetch('mexico_estados_final.svg');
        const svgText = await response.text();
        
        const contenedor = document.getElementById('mapaNacionalSVG');
        contenedor.innerHTML = svgText;
        
        console.log('✓ SVG cargado');
        
    } catch (error) {
        console.error('Error cargando SVG:', error);
    }
}

// ===== ACTUALIZACIÓN DEL MAPA =====

function actualizarMapaNacional() {
    const svg = document.querySelector('#mapaNacionalSVG svg');
    if (!svg) {
        console.warn('SVG no encontrado');
        return;
    }
    
    let coloreados = 0;
    
    // Colorear cada estado
    Object.keys(ID_SVG_A_NOMBRE).forEach(idSvg => {
        const path = svg.getElementById(idSvg);
        if (!path) return;
        
        const nombreEstado = ID_SVG_A_NOMBRE[idSvg];
        const homicidios = obtenerHomicidiosEstado(nombreEstado);
        const color = getColorHomicidiosFijo(homicidios);
        
        path.style.fill = color;
        path.style.stroke = '#333';
        path.style.strokeWidth = '0.5';
        
        coloreados++;
    });
    
    console.log(`✓ ${coloreados} estados coloreados`);
    
    // Actualizar números
    actualizarNumerosEnMapa();
    
    // Actualizar tabla
    actualizarTablaDatos();
    
    // Actualizar display de fecha
    const fecha = fechasDisponibles[indiceFechaActual] || '';
    const fechaDisplay = document.getElementById('fechaActualNacional');
    if (fechaDisplay) {
        fechaDisplay.textContent = formatearFecha(fecha);
    }
}

function actualizarNumerosEnMapa() {
    const svg = document.querySelector('#mapaNacionalSVG svg');
    if (!svg) return;
    
    // Limpiar etiquetas anteriores
    const etiquetasAnteriores = svg.querySelectorAll('.etiqueta-victimas');
    etiquetasAnteriores.forEach(e => e.remove());
    
    let creados = 0;
    
    // Crear nuevas etiquetas en centroides
    Object.keys(ID_SVG_A_NOMBRE).forEach(idSvg => {
        const nombreEstado = ID_SVG_A_NOMBRE[idSvg];
        const homicidios = obtenerHomicidiosEstado(nombreEstado);
        const centroide = CENTROIDES_ESTADOS[idSvg];
        
        if (!centroide) return;
        
        // Crear elemento <text> en SVG
        const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        texto.setAttribute('x', centroide.x);
        texto.setAttribute('y', centroide.y);
        texto.setAttribute('class', 'etiqueta-victimas');
        texto.setAttribute('font-size', '12px');
        texto.setAttribute('font-family', 'Arial, sans-serif');
        texto.setAttribute('fill', '#000000');
        texto.setAttribute('text-anchor', 'middle');
        texto.setAttribute('dominant-baseline', 'middle');
        texto.setAttribute('pointer-events', 'none');
        
        // Bold para cantidades > 0, Normal para 0
        if (homicidios > 0) {
            texto.setAttribute('font-weight', 'bold');
        } else {
            texto.setAttribute('font-weight', 'normal');
        }
        
        texto.textContent = homicidios;
        
        svg.appendChild(texto);
        creados++;
    });
    
    console.log(`✓ ${creados} etiquetas creadas en centroides`);
}

function obtenerHomicidiosEstado(nombreEstado) {
    const estadoData = datosNacionales.find(e => e.estado === nombreEstado);
    if (!estadoData) return 0;
    
    const valor = estadoData.valores[indiceFechaActual];
    return isNaN(valor) ? 0 : valor;
}

function getColorHomicidiosFijo(homicidios) {
    if (homicidios === 0) return '#f5f5f5';
    if (homicidios <= 2) return '#c6dbef';
    if (homicidios <= 4) return '#9ecae1';
    if (homicidios <= 6) return '#6baed6';
    if (homicidios <= 8) return '#4292c6';
    if (homicidios <= 10) return '#2171b5';
    return '#084594';
}

// ===== TABLA DE DATOS =====

function actualizarTablaDatos() {
    const tbody = document.querySelector('#tablaDatosNacional tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let totalNacional = 0;
    let totalAcumulado = 0;
    
    // Ordenar estados alfabéticamente
    const estadosOrdenados = [...datosNacionales].sort((a, b) => 
        a.estado.localeCompare(b.estado)
    );
    
    // Agregar fila por cada estado
    estadosOrdenados.forEach(estadoData => {
        const homicidios = estadoData.valores[indiceFechaActual] || 0;
        totalNacional += homicidios;
        
        // Buscar datos acumulados del mismo estado
        const estadoAcumulado = datosAcumulados.find(e => e.estado === estadoData.estado);
        const acumulado = estadoAcumulado ? (estadoAcumulado.valores[indiceFechaActual] || 0) : 0;
        totalAcumulado += acumulado;
        
        const tr = document.createElement('tr');
        
        const tdEstado = document.createElement('td');
        tdEstado.textContent = estadoData.estado;
        tdEstado.style.textAlign = 'left';
        
        // Resaltar Jalisco
        if (estadoData.estado === 'Jalisco') {
            tr.style.backgroundColor = '#ffffff';
            tr.style.fontWeight = 'bold';
        }
        
        const tdFecha = document.createElement('td');
        tdFecha.textContent = homicidios;
        tdFecha.style.textAlign = 'center';
        
        const tdAcumulado = document.createElement('td');
        tdAcumulado.textContent = acumulado;
        tdAcumulado.style.textAlign = 'center';
        
        tr.appendChild(tdEstado);
        tr.appendChild(tdFecha);
        tr.appendChild(tdAcumulado);
        tbody.appendChild(tr);
    });
    
    // Agregar fila de total
    const trTotal = document.createElement('tr');
    trTotal.style.fontWeight = 'bold';
    trTotal.style.backgroundColor = '#e9ecef';
    
    const tdTotalLabel = document.createElement('td');
    tdTotalLabel.textContent = 'Total nacional';
    tdTotalLabel.style.textAlign = 'left';
    
    const tdTotalValor = document.createElement('td');
    tdTotalValor.textContent = totalNacional;
    tdTotalValor.style.textAlign = 'center';
    
    const tdTotalAcumulado = document.createElement('td');
    tdTotalAcumulado.textContent = totalAcumulado;
    tdTotalAcumulado.style.textAlign = 'center';
    
    trTotal.appendChild(tdTotalLabel);
    trTotal.appendChild(tdTotalValor);
    trTotal.appendChild(tdTotalAcumulado);
    tbody.appendChild(trTotal);
    
    console.log(`✓ Tabla actualizada - Total Nacional: ${totalNacional}, Total Acumulado: ${totalAcumulado}`);
}

// ===== POPUPS =====

function configurarPopups() {
    const svg = document.querySelector('#mapaNacionalSVG svg');
    if (!svg) return;
    
    Object.keys(ID_SVG_A_NOMBRE).forEach(idSvg => {
        const path = svg.getElementById(idSvg);
        if (!path) return;
        
        path.style.cursor = 'pointer';
        
        path.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const nombreEstado = ID_SVG_A_NOMBRE[idSvg];
            const homicidios = obtenerHomicidiosEstado(nombreEstado);
            const fecha = fechasDisponibles[indiceFechaActual] || '';
            
            // Obtener coordenadas del click
            const x = e.clientX;
            const y = e.clientY;
            
            mostrarPopup(nombreEstado, fecha, homicidios, x, y);
        });
    });
    
    console.log('✓ Popups configurados');
}

function mostrarPopup(nombreEstado, fecha, victimas, x, y) {
    const popup = document.getElementById('popupEstado');
    if (!popup) return;
    
    document.getElementById('popupNombreEstado').textContent = nombreEstado;
    document.getElementById('popupFecha').textContent = formatearFechaPopup(fecha);
    document.getElementById('popupVictimas').textContent = victimas;
    
    // Posicionar en coordenadas del click
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.transform = 'translate(-50%, -100%)';  // Centrado horizontalmente, arriba del cursor
    
    popup.style.display = 'block';
}

function cerrarPopup() {
    const popup = document.getElementById('popupEstado');
    if (popup) {
        popup.style.display = 'none';
    }
}

// ===== CONTROLES TEMPORALES =====

function configurarControlesNacionales() {
    const slider = document.getElementById('sliderFechaNacional');
    const btnAnterior = document.getElementById('btnAnteriorNacional');
    const btnSiguiente = document.getElementById('btnSiguienteNacional');
    
    if (slider) {
        slider.max = fechasDisponibles.length - 1;
        slider.value = 0;
        
        slider.addEventListener('input', (e) => {
            indiceFechaActual = parseInt(e.target.value);
            actualizarMapaNacional();
        });
    }
    
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (indiceFechaActual > 0) {
                indiceFechaActual--;
                if (slider) slider.value = indiceFechaActual;
                actualizarMapaNacional();
            }
        });
    }
    
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            if (indiceFechaActual < fechasDisponibles.length - 1) {
                indiceFechaActual++;
                if (slider) slider.value = indiceFechaActual;
                actualizarMapaNacional();
            }
        });
    }
}

// ===== UTILIDADES =====

function establecerFechaInicial() {
    // Obtener fecha de ayer
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    
    const dia = ayer.getDate();
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const mes = meses[ayer.getMonth()];
    
    const fechaAyer = `${dia}-${mes}`;  // Formato: "29-oct"
    
    // Buscar índice de esa fecha en fechasDisponibles
    const indice = fechasDisponibles.indexOf(fechaAyer);
    
    if (indice !== -1) {
        indiceFechaActual = indice;
        console.log(`✓ Fecha inicial establecida: ${fechaAyer} (índice ${indice})`);
    } else {
        // Si no se encuentra, usar la última fecha disponible
        indiceFechaActual = fechasDisponibles.length - 1;
        console.log(`⚠ Fecha de ayer no encontrada, usando última disponible: ${fechasDisponibles[indiceFechaActual]}`);
    }
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length !== 2) return fecha;
    
    // Formato de entrada: "27-oct", "1-nov", etc.
    const dia = String(partes[0]).padStart(2, '0');
    const mesAbrev = partes[1].toLowerCase();
    
    const mesesMap = {
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
    };
    
    const mes = mesesMap[mesAbrev] || '01';
    const año = 2026;  // Año actualizado
    
    return `${dia}/${mes}/${año}`;
}

function formatearFechaPopup(fecha) {
    if (!fecha) return '';
    const partes = fecha.split('-');
    if (partes.length !== 3) return fecha;
    
    const dia = partes[0].padStart(2, '0');
    const mes = partes[1].padStart(2, '0');
    const año = partes[2].slice(-2);
    
    return `${dia}/${mes}/${año}`;
}

// ===== TABLAS DE HOMICIDIOS (REPORTES DIARIOS / CON FOSAS) =====

async function cargarTablasSinConFosas() {
    try {
        const datosSinFosas = await cargarTablaHomicidios('tablaSinFosas', URL_TABLA_SIN_FOSAS, 'Reportes Diarios');
        const datosConFosas = await cargarTablaHomicidios('tablaConFosas', URL_TABLA_CON_FOSAS, 'Con Fosas');
        
        // Crear gráficas después de cargar tablas
        if (datosSinFosas) crearGraficaHomicidios('graficaSinFosas', datosSinFosas, 'Reportes Diarios');
        if (datosConFosas) crearGraficaHomicidios('graficaConFosas', datosConFosas, 'Con Fosas');
        
        // Actualizar título dinámico con última fecha
        actualizarTituloTablas();
        
        // Inicializar gráfica de líneas con Jalisco (que está checked por defecto)
        // Usar requestAnimationFrame para garantizar que el DOM esté renderizado
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                actualizarGraficaLineasMensual();
            });
        });
        
        console.log('✓ Tablas y gráficas Sin/Con Fosas cargadas');
    } catch (error) {
        console.error('Error cargando tablas:', error);
    }
}

async function cargarTablaHomicidios(idTabla, url, tipo) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        
        const lineas = csvText.split('\n').filter(l => l.trim());
        if (lineas.length === 0) return;
        
        const encabezados = lineas[0].split(',').map(h => h.trim());
        
        // Crear encabezado de la tabla
        const tabla = document.getElementById(idTabla);
        if (!tabla) return;
        
        const thead = tabla.querySelector('thead');
        const tbody = tabla.querySelector('tbody');
        
        if (!thead || !tbody) return;
        
        // Limpiar
        thead.innerHTML = '';
        tbody.innerHTML = '';
        
        // Crear fila de encabezado con ordenamiento
        const trHead = document.createElement('tr');
        
        // Agregar columna de checkbox en el encabezado
        const thCheckbox = document.createElement('th');
        thCheckbox.textContent = '☑';
        thCheckbox.style.width = '40px';
        thCheckbox.style.textAlign = 'center';
        trHead.appendChild(thCheckbox);
        
        encabezados.forEach((enc, idx) => {
            const th = document.createElement('th');
            th.textContent = enc;
            th.style.cursor = 'pointer';
            th.style.userSelect = 'none';
            th.dataset.columna = idx;
            th.dataset.orden = 'asc';
            
            // Agregar evento de click para ordenar
            // idx + 1 porque la columna 0 es el checkbox
            th.addEventListener('click', () => ordenarTabla(idTabla, idx + 1, th));
            
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        
        // Crear filas de datos
        for (let i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(',').map(v => v.trim());
            
            const tr = document.createElement('tr');
            
            // Agregar checkbox al inicio de cada fila
            const tdCheckbox = document.createElement('td');
            tdCheckbox.style.textAlign = 'center';
            tdCheckbox.style.padding = '2px 4px';
            tdCheckbox.style.verticalAlign = 'middle';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'entidad-checkbox';
            checkbox.dataset.entidad = valores[0]; // Nombre de la entidad
            
            // Preselección: Solo Jalisco para tablas 2025, TOP 12 para tabla 2026
            if (idTabla === 'tabla2026') {
                // Para tabla 2026: marcar checkbox, se seleccionarán TOP 12 después de ordenar
                checkbox.dataset.marcarTop12 = 'true';
            } else {
                // Para otras tablas: solo Jalisco
                if (valores[0] && valores[0].toLowerCase().includes('jalisco')) {
                    checkbox.checked = true;
                }
            }
            
            tdCheckbox.appendChild(checkbox);
            tr.appendChild(tdCheckbox);
            
            valores.forEach((valor, idx) => {
                const td = document.createElement('td');
                
                // Reemplazar texto específico en primera columna
                if (idx === 0 && valor.toLowerCase().includes('homicidio doloso nacional')) {
                    td.textContent = 'Homicidios dolosos, TOTAL Nacional';
                } else {
                    td.textContent = valor;
                }
                
                // Primera columna alineada a la izquierda
                if (idx === 0) {
                    td.style.textAlign = 'left';
                    td.style.fontWeight = 'bold';
                    td.style.padding = '4px 8px';
                } else {
                    td.style.textAlign = 'center';
                    td.style.padding = '4px 6px';
                }
                
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        }
        
        // Ordenar automáticamente por columna Total (descendente)
        const columnaTotal = encabezados.length; // Última columna es Total (+1 por checkbox en posición 0)
        const filasArray = Array.from(tbody.querySelectorAll('tr'));
        filasArray.sort((a, b) => {
            const valorA = parseInt(a.cells[columnaTotal]?.textContent.trim() || '0');
            const valorB = parseInt(b.cells[columnaTotal]?.textContent.trim() || '0');
            return valorB - valorA; // Descendente
        });
        tbody.innerHTML = '';
        filasArray.forEach(fila => tbody.appendChild(fila));
        
        // Si es tabla 2026, preseleccionar TOP 12 estados por TOTAL
        if (idTabla === 'tabla2026') {
            const checkboxes = tbody.querySelectorAll('.entidad-checkbox[data-marcar-top12="true"]');
            let contador = 0;
            checkboxes.forEach((checkbox, idx) => {
                // Marcar los primeros 12 (excluyendo fila TOTAL/NACIONAL si existe)
                const entidad = checkbox.dataset.entidad || '';
                if (!entidad.toLowerCase().includes('total') && !entidad.toLowerCase().includes('nacional') && contador < 12) {
                    checkbox.checked = true;
                    contador++;
                }
            });
            console.log(`✅ Preseleccionados ${contador} estados TOP 12 en tabla 2026`);
        }
        
        // Procesar datos para gráfica
        const datosGrafica = procesarDatosParaGrafica(lineas, encabezados);
        return datosGrafica;
        
    } catch (error) {
        console.error(`Error cargando tabla ${tipo}:`, error);
        return null;
    }
}

// ===== GRÁFICAS DE HOMICIDIOS =====

function procesarDatosParaGrafica(lineas, encabezados) {
    const datos = [];
    
    // Saltar primera fila (encabezados) y fila de NACIONAL
    for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i].split(',').map(v => v.trim());
        const entidad = valores[0];
        
        // Saltar fila NACIONAL
        if (entidad.toLowerCase().includes('nacional')) continue;
        
        // Extraer datos por mes (columnas 2-11 son los meses)
        const meses = [];
        let total = 0;
        
        for (let j = 1; j <= 12; j++) { // Enero a Diciembre
            const valor = Math.max(0, parseInt(valores[j]) || 0);  // Convertir negativos a 0
            meses.push(valor);
            total += valor;
        }
        
        datos.push({
            entidad,
            meses,
            total
        });
    }
    
    // Ordenar de mayor a menor por total
    datos.sort((a, b) => b.total - a.total);
    
    return datos;
}

function crearGraficaHomicidios(canvasId, datos, titulo) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas ${canvasId} no encontrado`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfica existente si existe
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Preparar datos
    const entidades = datos.map(d => d.entidad);
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Colores por mes (paleta variada) - INVERTIDA
    const coloresMeses = [
        '#dbdb8d',  // Enero - Amarillo claro (era Diciembre)
        '#9edae5', // Febrero - Azul claro (era Noviembre)
        '#17becf', // Marzo - Cian (era Octubre)
        '#bcbd22', // Abril - Amarillo verdoso (era Septiembre)
        '#7f7f7f', // Mayo - Gris (era Agosto)
        '#e377c2', // Junio - Rosa (era Julio)
        '#8c564b', // Julio - Marrón (era Junio)
        '#9467bd', // Agosto - Púrpura (era Mayo)
        '#d62728', // Septiembre - Rojo (era Abril)
        '#2ca02c', // Octubre - Verde (era Marzo)
        '#ff7f0e', // Noviembre - Naranja (era Febrero)
        '#1f77b4'  // Diciembre - Azul (era Enero)
    ];
    
    // Crear datasets (uno por mes)
    const datasets = [];
    for (let i = 0; i < 12; i++) {
        datasets.push({
            label: mesesNombres[i],
            data: datos.map(d => d.meses[i]),
            backgroundColor: coloresMeses[i],
            borderColor: coloresMeses[i],
            borderWidth: 1
        });
    }
    
    // Crear gráfica
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: entidades,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: titulo === 'Con Fosas' ? 'Homicidios dolosos - (incluye víctimas de fosas)' : 'Homicidios dolosos 2025',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        boxHeight: 8,
                        padding: 6,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        afterTitle: function(context) {
                            // Calcular el total sumando todos los meses
                            const total = context.reduce((sum, item) => sum + item.parsed.y, 0);
                            return 'Total = ' + total.toLocaleString();
                        },
                        label: function(context) {
                            const mes = context.dataset.label;
                            const valor = context.parsed.y;
                            return mes + ': ' + valor;
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value, context) => {
                        // Calcular el total de la barra sumando todos los datasets
                        const datasetArray = context.chart.data.datasets;
                        const dataIndex = context.dataIndex;
                        const total = datasetArray.reduce((sum, dataset) => {
                            return sum + (dataset.data[dataIndex] || 0);
                        }, 0);
                        
                        // Mostrar solo en el último dataset (arriba de la barra)
                        if (context.datasetIndex === datasetArray.length - 1) {
                            return total.toLocaleString();
                        }
                        return '';
                    },
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    color: '#000'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotation: 45,
                        font: { size: 14 }
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    min: 0,  // Forzar inicio en 0
                    title: {
                        display: false  // Ocultar leyenda del eje Y
                    }
                }
            }
        }
    });
    
    console.log(`✓ Gráfica ${titulo} creada con ${datos.length} entidades`);
}

// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        inicializarMapaNacional();
        cargarTabla2026();
        cargarTablasSinConFosas();
    });
} else {
    inicializarMapaNacional();
    cargarTabla2026();
    cargarTablasSinConFosas();
}




// ===== PESTAÑAS DE NAVEGACIÓN =====

function actualizarMapaDinamico() {
    console.log('🔄 Actualizando mapa dinámico...');
    
    // Verificar si el mapa ya fue inicializado
    if (typeof map === 'undefined' || map === null) {
        // Primera vez - inicializar mapa
        console.log('🎉 Inicializando mapa dinámico por primera vez...');
        
        if (typeof initializeMap === 'function') {
            initializeMap();
            
            // Esperar a que se inicialice y luego cargar datos
            setTimeout(() => {
                if (typeof updateMapMarkers === 'function' && typeof filteredData !== 'undefined') {
                    updateMapMarkers(filteredData);
                    console.log('✓ Mapa inicializado y datos cargados');
                }
            }, 500);
        } else {
            console.error('❌ No se encontró la función initializeMap');
        }
    } else {
        // Mapa ya existe - solo actualizar
        console.log('🔄 Mapa ya existe, actualizando...');
        
        // Forzar recalcular tamaño
        map.invalidateSize();
        
        // Actualizar marcadores
        if (typeof updateMapMarkers === 'function' && typeof filteredData !== 'undefined') {
            updateMapMarkers(filteredData);
            console.log('✓ Mapa actualizado correctamente');
        }
    }
}

function inicializarTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remover active de todos los botones y contenidos
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activar botón y contenido seleccionado
            btn.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Si se activa la pestaña de Carpetas, actualizar el mapa
            if (tabId === 'carpetas') {
                actualizarMapaDinamico();
            }
        });
    });
    
    console.log('✓ Tabs inicializados');
}

// Inicializar tabs al cargar
document.addEventListener('DOMContentLoaded', inicializarTabs);




// ===== ORDENAMIENTO DE TABLAS =====

function ordenarTabla(idTabla, columna, th) {
    const tabla = document.getElementById(idTabla);
    if (!tabla) return;
    
    const tbody = tabla.querySelector('tbody');
    if (!tbody) return;
    
    const filas = Array.from(tbody.querySelectorAll('tr'));
    const ordenActual = th.dataset.orden || 'asc';
    const nuevoOrden = ordenActual === 'asc' ? 'desc' : 'asc';
    
    // Determinar si es columna numérica o texto
    const primerValor = filas[0]?.cells[columna]?.textContent.trim();
    const esNumerico = !isNaN(parseFloat(primerValor));
    
    // Ordenar filas
    filas.sort((a, b) => {
        const valorA = a.cells[columna]?.textContent.trim() || '';
        const valorB = b.cells[columna]?.textContent.trim() || '';
        
        let comparacion;
        if (esNumerico) {
            comparacion = parseFloat(valorA) - parseFloat(valorB);
        } else {
            comparacion = valorA.localeCompare(valorB, 'es');
        }
        
        return nuevoOrden === 'asc' ? comparacion : -comparacion;
    });
    
    // Limpiar y reagregar filas ordenadas
    tbody.innerHTML = '';
    filas.forEach(fila => tbody.appendChild(fila));
    
    // Actualizar indicadores visuales
    tabla.querySelectorAll('th').forEach(header => {
        header.textContent = header.textContent.replace(' ▲', '').replace(' ▼', '');
    });
    
    th.textContent = th.textContent.replace(' ▲', '').replace(' ▼', '') + (nuevoOrden === 'asc' ? ' ▲' : ' ▼');
    th.dataset.orden = nuevoOrden;
}




// ===== SISTEMA DE DESCARGA =====

function descargarMapaNacional() {
    const fecha = document.getElementById('fechaActualNacional').textContent;
    const fechaArchivo = fecha.replace(/ de /g, '_').replace(/ /g, '_');
    
    // 1. Descargar captura completa de la sección
    descargarCapturaSeccion(fechaArchivo);
    
    // 2. Descargar tabla en XLSX
    setTimeout(() => descargarTablaXLSX(fechaArchivo), 500);
    
    // 3. Descargar mapa SVG como JPEG
    setTimeout(() => descargarMapaSVG(fechaArchivo), 1000);
}

function descargarCapturaSeccion(fechaArchivo) {
    const seccion = document.getElementById('seccionMapaNacional');
    const boton = document.getElementById('btnDescargarMapaNacional');
    
    // Ocultar botón temporalmente
    boton.style.display = 'none';
    
    html2canvas(seccion, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        // Restaurar botón
        boton.style.display = 'block';
        
        // Convertir a JPEG y descargar
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Mapa_Nacional_${fechaArchivo}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);
    }).catch(error => {
        boton.style.display = 'block';
        console.error('Error capturando sección:', error);
    });
}

function descargarTablaXLSX(fechaArchivo) {
    const tabla = document.getElementById('tablaDatosNacional');
    
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Convertir tabla HTML a worksheet
    const ws = XLSX.utils.table_to_sheet(tabla);
    
    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Nacionales');
    
    // Descargar archivo
    XLSX.writeFile(wb, `Datos_Nacional_${fechaArchivo}.xlsx`);
}

function descargarMapaSVG(fechaArchivo) {
    const mapaSVG = document.querySelector('#mapaNacionalSVG svg');
    
    if (!mapaSVG) {
        console.error('SVG del mapa no encontrado');
        return;
    }
    
    // Clonar SVG
    const svgClone = mapaSVG.cloneNode(true);
    
    // Obtener dimensiones
    const bbox = mapaSVG.getBBox();
    const width = bbox.width || 1000;
    const height = bbox.height || 630;
    
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;  // Escala 2x para mejor calidad
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Convertir SVG a imagen
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a JPEG y descargar
        canvas.toBlob(blob => {
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Mapa_SVG_${fechaArchivo}.jpg`;
            a.click();
            URL.revokeObjectURL(downloadUrl);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.95);
    };
    img.src = url;
}

// Event listener para botón de descarga
document.addEventListener('DOMContentLoaded', function() {
    const btnDescargar = document.getElementById('btnDescargarMapaNacional');
    if (btnDescargar) {
        btnDescargar.addEventListener('click', descargarMapaNacional);
    }
});




// ==========================================
// FUNCIONES DE DESCARGA PARA SECCIÓN SIN FOSAS
// ==========================================

// Funciones antiguas de descarga eliminadas - ahora se usan menús desplegables


// ============================================
// FUNCIONALIDAD BANNER COLAPSABLE
// ============================================

// Banner Sin Fosas (Tablas de Homicidios Dolosos)
document.getElementById('bannerSinFosas').addEventListener('click', function() {
    const seccion = document.getElementById('seccionSinFosas');
    const icono = document.getElementById('iconoSinFosas');
    
    if (seccion.style.display === 'none') {
        // Expandir
        seccion.style.display = 'block';
        icono.textContent = '−';
    } else {
        // Contraer
        seccion.style.display = 'none';
        icono.textContent = '+';
    }
});

// Banner Con Fosas
document.getElementById('bannerConFosas').addEventListener('click', function() {
    const seccion = document.getElementById('seccionConFosas');
    const icono = document.getElementById('iconoConFosas');
    
    if (seccion.style.display === 'none') {
        // Expandir
        seccion.style.display = 'block';
        icono.textContent = '−';
    } else {
        // Contraer
        seccion.style.display = 'none';
        icono.textContent = '+';
    }
});




// ============================================
// FUNCIONALIDAD MENÚS DE DESCARGA
// ============================================

// Toggle menús al hacer click en los botones
document.getElementById('btnMenuMapaNacional').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('menuMapaNacional');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    
    // Cerrar otros menús
    document.getElementById('menuSinFosas').style.display = 'none';
    document.getElementById('menuConFosas').style.display = 'none';
    document.getElementById('menu2026').style.display = 'none';
});

document.getElementById('btnMenuSinFosas').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('menuSinFosas');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    
    // Cerrar otros menús
    document.getElementById('menuMapaNacional').style.display = 'none';
    document.getElementById('menuConFosas').style.display = 'none';
    document.getElementById('menu2026').style.display = 'none';
});

document.getElementById('btnMenuConFosas').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('menuConFosas');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    
    // Cerrar otros menús
    document.getElementById('menuMapaNacional').style.display = 'none';
    document.getElementById('menuSinFosas').style.display = 'none';
    document.getElementById('menu2026').style.display = 'none';
});

document.getElementById('btnMenu2026').addEventListener('click', function(e) {
    e.stopPropagation();
    const menu = document.getElementById('menu2026');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    
    // Cerrar otros menús
    document.getElementById('menuMapaNacional').style.display = 'none';
    document.getElementById('menuSinFosas').style.display = 'none';
    document.getElementById('menuConFosas').style.display = 'none';
});

// Cerrar menús al hacer click fuera
document.addEventListener('click', function() {
    document.getElementById('menuMapaNacional').style.display = 'none';
    document.getElementById('menuSinFosas').style.display = 'none';
    document.getElementById('menuConFosas').style.display = 'none';
    document.getElementById('menu2026').style.display = 'none';
});

// Manejar clicks en opciones de descarga
document.querySelectorAll('.opcion-descarga').forEach(boton => {
    boton.addEventListener('click', async function(e) {
        e.stopPropagation();
        
        const tipo = this.getAttribute('data-tipo');
        const seccion = this.getAttribute('data-seccion');
        
        // Cerrar menú
        this.closest('.menu-descarga-opciones').style.display = 'none';
        
        // Ejecutar descarga según tipo y sección
        await ejecutarDescarga(tipo, seccion);
    });
});

// ============================================
// FUNCIÓN EJECUTAR DESCARGA INDIVIDUAL
// ============================================

async function ejecutarDescarga(tipo, seccion) {
    try {
        if (seccion === 'mapaNacional') {
            await descargarMapaNacional(tipo);
        } else if (seccion === 'sinFosas') {
            await descargarSinFosas(tipo);
        } else if (seccion === 'conFosas') {
            await descargarConFosas(tipo);
        } else if (seccion === '2026') {
            await descargar2026(tipo);
        }
    } catch (error) {
        console.error('Error al descargar:', error);
        alert('Error al generar la descarga');
    }
}

// ============================================
// FUNCIONES DE DESCARGA MAPA NACIONAL
// ============================================

async function descargarMapaNacional(tipo) {
    const seccion = document.querySelector('.mapa-nacional-container');
    const botonMenu = document.getElementById('btnMenuMapaNacional');
    
    // Obtener fecha actual del mapa (fecha seleccionada por el usuario)
    const fechaActual = fechasDisponibles[indiceFechaActual] || '';
    const fechaFormateada = formatearFechaParaArchivo(fechaActual);
    
    // Ocultar botón temporalmente
    botonMenu.closest('.menu-descarga-container').style.display = 'none';
    
    try {
        if (tipo === 'captura') {
            // Captura de pantalla
            const canvas = await html2canvas(seccion, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Mapa_Nacional_Homicidios_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
            
        } else if (tipo === 'xlsx') {
            // Descargar tabla
            const tabla = document.getElementById('tablaDatosNacional');
            const wb = XLSX.utils.table_to_book(tabla, {sheet: "Mapa Nacional"});
            XLSX.writeFile(wb, `Tabla_Mapa_Nacional_${fechaFormateada}.xlsx`);
        }
    } finally {
        // Restaurar botón
        botonMenu.closest('.menu-descarga-container').style.display = 'block';
    }
}

// ============================================
// FUNCIONES DE DESCARGA REPORTES DIARIOS
// ============================================

async function descargarSinFosas(tipo) {
    const seccion = document.getElementById('seccionSinFosas');
    const botonMenu = document.getElementById('btnMenuSinFosas');
    
    // Obtener última fecha con datos (fecha fija para acumulados)
    const fechaFormateada = obtenerUltimaFechaConDatos();
    
    // Ocultar botón temporalmente
    botonMenu.closest('.menu-descarga-container').style.display = 'none';
    
    try {
        if (tipo === 'captura') {
            // Captura de pantalla completa
            const canvas = await html2canvas(seccion, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Acumulado_HomicidiosDolosos_Reportes_Diarios_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
            
        } else if (tipo === 'xlsx') {
            // Descargar tabla
            const tabla = document.getElementById('tablaSinFosas');
            const wb = XLSX.utils.table_to_book(tabla, {sheet: "Reportes Diarios"});
            XLSX.writeFile(wb, `Homicidios_Dolosos_Reportes_Diarios_${fechaFormateada}.xlsx`);
            
        } else if (tipo === 'jpeg') {
            // Descargar gráfica de barras
            const canvasGrafica = document.getElementById('graficaSinFosas');
            
            // Crear canvas temporal con fondo blanco
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasGrafica.width;
            tempCanvas.height = canvasGrafica.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Rellenar con fondo blanco
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Dibujar la gráfica encima
            tempCtx.drawImage(canvasGrafica, 0, 0);
            
            // Descargar desde canvas temporal
            tempCanvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Homicidios_Dolosos_Reportes_Diarios_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
            
        } else if (tipo === 'jpeg-lineal') {
            // Descargar gráfica lineal con título
            const contenedor = document.getElementById('contenedorGraficaLineal');
            
            if (!contenedor) {
                alert('La gráfica lineal no está disponible. Por favor, selecciona al menos una entidad.');
                return;
            }
            
            // Usar html2canvas para capturar el contenedor completo (título + gráfica)
            const canvas = await html2canvas(contenedor, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Tendencia_Mensual_Homicidios_Dolosos_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
        }
    } finally {
        // Restaurar botón
        botonMenu.closest('.menu-descarga-container').style.display = 'block';
    }
}

// ============================================
// FUNCIONES DE DESCARGA CON FOSAS
// ============================================

async function descargarConFosas(tipo) {
    const seccion = document.getElementById('seccionConFosas');
    const botonMenu = document.getElementById('btnMenuConFosas');
    
    // Obtener última fecha con datos (fecha fija para acumulados)
    const fechaFormateada = obtenerUltimaFechaConDatos();
    
    // Ocultar botón temporalmente
    botonMenu.closest('.menu-descarga-container').style.display = 'none';
    
    try {
        if (tipo === 'captura') {
            // Captura de pantalla completa
            const canvas = await html2canvas(seccion, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Acumulado_HomicidiosDolosos_cVF_Reportes_Diarios_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
            
        } else if (tipo === 'xlsx') {
            // Descargar tabla
            const tabla = document.getElementById('tablaConFosas');
            const wb = XLSX.utils.table_to_book(tabla, {sheet: "Con Fosas"});
            XLSX.writeFile(wb, `Homicidios_Dolosos_cVF_Reportes_Diarios_${fechaFormateada}.xlsx`);
            
        } else if (tipo === 'jpeg') {
            // Descargar gráfica
            const canvasGrafica = document.getElementById('graficaConFosas');
            
            // Crear canvas temporal con fondo blanco
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasGrafica.width;
            tempCanvas.height = canvasGrafica.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Rellenar con fondo blanco
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Dibujar la gráfica encima
            tempCtx.drawImage(canvasGrafica, 0, 0);
            
            // Descargar desde canvas temporal
            tempCanvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Homicidios_Dolosos_cVF_Reportes_Diarios_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
        }
    } finally {
        // Restaurar botón
        botonMenu.closest('.menu-descarga-container').style.display = 'block';
    }
}


// ===== FUNCIONES PARA GRÁFICA DE LÍNEAS MENSUAL =====

// Variable global para almacenar la instancia de la gráfica de líneas
let graficaLineasMensual = null;

// Función para calcular regresión lineal
function calcularRegresionLineal(datos) {
    const n = datos.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    datos.forEach((valor, index) => {
        sumX += index;
        sumY += valor;
        sumXY += index * valor;
        sumX2 += index * index;
    });
    
    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercepto = (sumY - pendiente * sumX) / n;
    
    // Generar puntos de la línea de tendencia
    return datos.map((_, index) => pendiente * index + intercepto);
}

// Función para generar colores únicos para cada entidad
function generarColorEntidad(index) {
    const colores = [
        '#FFB800', // Amarillo/Dorado (Jalisco por defecto)
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#FF6384',
        '#C9CBCF',
        '#4BC0C0'
    ];
    return colores[index % colores.length];
}

// Función para actualizar la gráfica de líneas mensual
function actualizarGraficaLineasMensual() {
    const checkboxes = document.querySelectorAll('.entidad-checkbox:checked');
    const entidadesSeleccionadas = Array.from(checkboxes).map(cb => cb.dataset.entidad);
    
    if (entidadesSeleccionadas.length === 0) {
        // Si no hay entidades seleccionadas, destruir la gráfica y limpiar canvas
        if (graficaLineasMensual) {
            graficaLineasMensual.destroy();
            graficaLineasMensual = null;
        }
        
        // Limpiar el canvas completamente usando las dimensiones correctas
        const canvas = document.getElementById('graficaLineasMensual');
        if (canvas) {
            const context = canvas.getContext('2d');
            // Usar canvas.width y canvas.height (atributos del elemento canvas)
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        return;
    }
    
    // Obtener datos de la tabla
    const tabla = document.getElementById('tablaSinFosas');
    if (!tabla) return;
    
    const encabezados = Array.from(tabla.querySelectorAll('thead th'))
        .slice(1) // Saltar columna de checkbox
        .map(th => th.textContent.trim());
    
    // Filtrar solo columnas de meses (excluir "Entidad" y "Total")
    const indicesMeses = [];
    const etiquetasMeses = [];
    encabezados.forEach((enc, idx) => {
        if (idx > 0 && idx < encabezados.length - 1) { // Excluir primera (Entidad) y última (Total)
            // idx ya viene de encabezados que empiezan en 0 (Entidad)
            // En la tabla real: columna 0 = checkbox, columna 1 = Entidad, columna 2+ = meses
            indicesMeses.push(idx + 1); // idx=1 (Febrero) -> celda 2 en tabla
            etiquetasMeses.push(enc);
        }
    });
    
    // Extraer datos de cada entidad seleccionada
    const datasets = [];
    entidadesSeleccionadas.forEach((entidad, colorIndex) => {
        const filas = Array.from(tabla.querySelectorAll('tbody tr'));
        const filaEntidad = filas.find(fila => {
            const nombreCelda = fila.cells[1]; // Columna 1 es el nombre (0 es checkbox)
            return nombreCelda && nombreCelda.textContent.trim() === entidad;
        });
        
        if (filaEntidad) {
            const datosMensuales = indicesMeses.map(idx => {
                const valor = filaEntidad.cells[idx]?.textContent.trim() || '0';
                return parseInt(valor) || 0;
            });
            
            const color = generarColorEntidad(colorIndex);
            
            // Dataset de la línea principal
            datasets.push({
                label: entidad,
                data: datosMensuales,
                borderColor: color,
                backgroundColor: color,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.1,
                fill: false
            });
            
            // Dataset de la línea de tendencia
            const tendencia = calcularRegresionLineal(datosMensuales);
            datasets.push({
                label: `Lineal (${entidad})`,
                data: tendencia,
                borderColor: color, // Mismo color que la línea principal
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0,
                fill: false
            });
        }
    });
    
    // Crear o actualizar gráfica
    const ctx = document.getElementById('graficaLineasMensual');
    if (!ctx) return;
    
    if (graficaLineasMensual) {
        graficaLineasMensual.destroy();
    }
    
    graficaLineasMensual = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetasMeses,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 8,
                        font: {
                            size: 10
                        },
                        pointStyle: 'circle',
                        pointStyleWidth: 8
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += Math.round(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                datalabels: {
                    display: false // No mostrar valores en cada punto
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: false  // Etiqueta de eje Y eliminada
                    }
                },
                x: {
                    title: {
                        display: false  // Etiqueta de eje X eliminada
                    }
                }
            }
        }
    });
}


// ===== EVENT LISTENERS PARA CHECKBOXES =====

// Usar delegación de eventos para manejar checkboxes dinámicos
// Se ejecuta directamente sin DOMContentLoaded para evitar duplicación
document.addEventListener('change', function(e) {
    if (e.target.classList.contains('entidad-checkbox')) {
        actualizarGraficaLineasMensual();
    }
});



// ===== TABLA 2026 =====

const SHEET_ID_2026 = '1I6eGs9L4vICNaIAxr2yJi7953ch6fUyIRV-G-EHdI78';
const URL_TABLA_2026 = `https://docs.google.com/spreadsheets/d/${SHEET_ID_2026}/export?format=csv&gid=863156308&range=A81:N114`;

let grafica2026Instance = null;

async function cargarTabla2026() {
    try {
        console.log('🔄 Cargando datos de tabla 2026...');
        console.log('URL:', URL_TABLA_2026);
        
        // Verificar que la tabla existe en el DOM
        const tabla = document.getElementById('tabla2026');
        if (!tabla) {
            console.error('❌ Tabla con id="tabla2026" no encontrada en el DOM');
            return;
        }
        console.log('✅ Tabla encontrada en el DOM');
        
        const datosGrafica = await cargarTablaHomicidios('tabla2026', URL_TABLA_2026, '2026');
        console.log('Datos de gráfica recibidos:', datosGrafica);
        
        if (datosGrafica && datosGrafica.length > 0) {
            console.log(`✅ ${datosGrafica.length} entidades procesadas`);
            crearGrafica2026(datosGrafica);
            agregarEventosCheckbox2026();
        } else {
            console.warn('⚠️ No se recibieron datos para la gráfica 2026');
        }
        
        // Actualizar fecha en el título
        actualizarFecha2026();
        
        console.log('✅ Tabla 2026 cargada exitosamente');
    } catch (error) {
        console.error('❌ Error cargando tabla 2026:', error);
        console.error('Stack trace:', error.stack);
    }
}



function actualizarFecha2026() {
    const fechaSpan = document.getElementById('fechaActual2026');
    if (fechaSpan) {
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const anio = String(hoy.getFullYear()).slice(-2); // Últimos 2 dígitos del año
        fechaSpan.textContent = `${dia}-${mes}-${anio}`;
    }
}

function crearGrafica2026(datosGrafica) {
    const canvas = document.getElementById('grafica2026');
    if (!canvas) {
        console.error('❌ Canvas grafica2026 no encontrado');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfica anterior si existe
    if (grafica2026Instance) {
        grafica2026Instance.destroy();
    }
    
    // Filtrar solo entidades seleccionadas
    const checkboxes = document.querySelectorAll('#tabla2026 .entidad-checkbox:checked');
    const entidadesSeleccionadas = Array.from(checkboxes).map(cb => cb.dataset.entidad);
    
    const datosFiltrados = datosGrafica.filter(d => entidadesSeleccionadas.includes(d.entidad));
    
    if (datosFiltrados.length === 0) {
        console.log('⚠️ No hay entidades seleccionadas para la gráfica 2026');
        return;
    }
    
    // Preparar datos para gráfica de barras apiladas
    const entidades = datosFiltrados.map(d => d.entidad);
    
    // Colores para cada mes (paleta azul rey/marino) - INVERTIDA
    const coloresMeses = [
        '#42a5f5',  // Enero - Azul cielo (era Diciembre)
        '#1e88e5', // Febrero - Azul brillante (era Noviembre)
        '#1976d2', // Marzo - Azul real (era Octubre)
        '#1565c0', // Abril - Azul real oscuro (era Septiembre)
        '#9fa8da', // Mayo - Azul lavanda (era Agosto)
        '#7986cb', // Junio - Azul rey claro (era Julio)
        '#5c6bc0', // Julio - Azul rey (era Junio)
        '#3f51b5', // Agosto - Azul índigo claro (era Mayo)
        '#3949ab', // Septiembre - Azul índigo medio (era Abril)
        '#303f9f', // Octubre - Azul índigo (era Marzo)
        '#283593', // Noviembre - Azul índigo oscuro (era Febrero)
        '#1a237e'  // Diciembre - Azul marino oscuro (era Enero)
    ];
    
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Crear datasets por mes
    const datasets = [];
    for (let mesIdx = 0; mesIdx < 12; mesIdx++) {
        datasets.push({
            label: nombresMeses[mesIdx],
            data: datosFiltrados.map(d => d.meses[mesIdx] || 0),
            backgroundColor: coloresMeses[mesIdx],
            borderColor: coloresMeses[mesIdx],
            borderWidth: 1
        });
    }
    
    grafica2026Instance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: entidades,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Homicidios Dolosos 2026',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        boxHeight: 8,
                        padding: 6,
                        font: {
                            size: 10
                        }
                    }
                },
                datalabels: {
                    display: function(context) {
                        // Mostrar solo el total en la última barra de cada stack
                        return context.datasetIndex === context.chart.data.datasets.length - 1;
                    },
                    formatter: function(value, context) {
                        // Calcular total sumando todos los datasets
                        let total = 0;
                        context.chart.data.datasets.forEach(dataset => {
                            total += dataset.data[context.dataIndex] || 0;
                        });
                        return total > 0 ? total : '';
                    },
                    anchor: 'end',
                    align: 'top',
                    color: '#000',
                    font: { weight: 'bold', size: 17 } // +50% de 11 = 16.5, redondeado a 17
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        autoSkip: false,
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    stacked: true,
                    display: false, // Sin eje Y según preferencia del usuario
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function agregarEventosCheckbox2026() {
    const checkboxes = document.querySelectorAll('#tabla2026 .entidad-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Recargar gráfica con nuevas selecciones
            const tabla = document.getElementById('tabla2026');
            if (!tabla) return;
            
            const tbody = tabla.querySelector('tbody');
            const lineas = [];
            const encabezados = [];
            
            // Extraer encabezados
            const thead = tabla.querySelector('thead tr');
            if (thead) {
                Array.from(thead.cells).slice(1).forEach(th => {
                    encabezados.push(th.textContent.trim());
                });
            }
            
            // Extraer datos de filas
            Array.from(tbody.rows).forEach(row => {
                const valores = [];
                Array.from(row.cells).slice(1).forEach(cell => {
                    valores.push(cell.textContent.trim());
                });
                lineas.push(valores.join(','));
            });
            
            const datosGrafica = procesarDatosParaGrafica(lineas, encabezados);
            if (datosGrafica) {
                crearGrafica2026(datosGrafica);
            }
        });
    });
}


// ============================================
// FUNCIONES DE DESCARGA SECCIÓN 2026
// ============================================

async function descargar2026(tipo) {
    const seccion = document.getElementById('seccion2026');
    const botonMenu = document.getElementById('btnMenu2026');
    
    // Validar que la sección existe
    if (!seccion) {
        console.error('Sección 2026 no encontrada');
        alert('Error: No se encontró la sección 2026');
        return;
    }
    
    // Obtener fecha actual para el nombre del archivo
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    const fechaFormateada = `${dia}-${mes}-${anio}`;
    
    // Ocultar botón temporalmente
    if (botonMenu) {
        botonMenu.closest('.menu-descarga-container').style.display = 'none';
    }
    
    try {
        if (tipo === 'captura') {
            // Captura de pantalla completa de la sección
            const canvas = await html2canvas(seccion, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Homicidios_Dolosos_2026_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
            
        } else if (tipo === 'xlsx') {
            // Descargar tabla en XLSX
            const tabla = document.getElementById('tabla2026');
            const wb = XLSX.utils.table_to_book(tabla, {sheet: "Homicidios 2026"});
            XLSX.writeFile(wb, `Homicidios_Dolosos_2026_${fechaFormateada}.xlsx`);
            
        } else if (tipo === 'jpeg') {
            // Descargar gráfica de barras apiladas
            const canvasGrafica = document.getElementById('grafica2026');
            
            // Crear canvas temporal con fondo blanco
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasGrafica.width;
            tempCanvas.height = canvasGrafica.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Rellenar con fondo blanco
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Dibujar la gráfica encima
            tempCtx.drawImage(canvasGrafica, 0, 0);
            
            // Descargar desde canvas temporal
            tempCanvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Grafica_Homicidios_Dolosos_2026_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
            
        } else if (tipo === 'jpeg-lineal') {
            // Descargar gráfica lineal mensual 2026
            // Primero verificar si hay entidades seleccionadas
            const checkboxes = document.querySelectorAll('#tabla2026 .entidad-checkbox:checked');
            
            if (checkboxes.length === 0) {
                alert('Por favor, selecciona al menos una entidad para generar la gráfica lineal.');
                return;
            }
            
            // Crear gráfica lineal temporal
            await crearGraficaLineal2026();
            
            // Esperar un momento para que se renderice
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const contenedor = document.getElementById('contenedorGraficaLineal2026');
            
            if (!contenedor) {
                alert('Error al generar la gráfica lineal.');
                return;
            }
            
            // Usar html2canvas para capturar el contenedor completo
            const canvas = await html2canvas(contenedor, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Tendencia_Mensual_Homicidios_2026_${fechaFormateada}.jpg`;
                link.click();
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);
        }
    } catch (error) {
        console.error('Error en descarga 2026:', error);
        alert('Error al generar la descarga: ' + error.message);
    } finally {
        // Restaurar botón
        if (botonMenu) {
            botonMenu.closest('.menu-descarga-container').style.display = 'block';
        }
    }
}

// Variable global para la gráfica lineal 2026
let graficaLineal2026Instance = null;

// Función para crear gráfica lineal mensual 2026
async function crearGraficaLineal2026() {
    // Verificar si ya existe el contenedor, si no, crearlo
    let contenedor = document.getElementById('contenedorGraficaLineal2026');
    
    if (!contenedor) {
        // Crear contenedor
        contenedor = document.createElement('div');
        contenedor.id = 'contenedorGraficaLineal2026';
        contenedor.className = 'grafica-container';
        contenedor.style.marginTop = '30px';
        contenedor.style.paddingBottom = '60px';
        contenedor.style.display = 'none'; // Oculto por defecto
        
        // Crear título
        const titulo = document.createElement('h4');
        titulo.style.textAlign = 'center';
        titulo.style.marginBottom = '15px';
        titulo.textContent = 'Tendencia Mensual de Homicidios Dolosos 2026';
        
        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'graficaLineal2026';
        
        contenedor.appendChild(titulo);
        contenedor.appendChild(canvas);
        
        // Insertar después de la gráfica de barras
        const seccion2026 = document.getElementById('seccion2026');
        const graficaBarras = seccion2026 ? seccion2026.querySelector('.grafica-container') : null;
        if (graficaBarras && graficaBarras.parentNode) {
            graficaBarras.parentNode.insertBefore(contenedor, graficaBarras.nextSibling);
        } else if (seccion2026) {
            // Si no se encuentra la gráfica, agregar al final de la sección
            seccion2026.appendChild(contenedor);
        } else {
            console.error('No se encontró la sección 2026 para insertar la gráfica lineal');
            return;
        }
    }
    
    // Mostrar contenedor
    contenedor.style.display = 'block';
    
    // Obtener entidades seleccionadas
    const checkboxes = document.querySelectorAll('#tabla2026 .entidad-checkbox:checked');
    const entidadesSeleccionadas = Array.from(checkboxes).map(cb => cb.dataset.entidad);
    
    if (entidadesSeleccionadas.length === 0) {
        contenedor.style.display = 'none';
        return;
    }
    
    // Obtener datos de la tabla
    const tabla = document.getElementById('tabla2026');
    if (!tabla) return;
    
    const encabezados = Array.from(tabla.querySelectorAll('thead th'))
        .slice(1) // Saltar columna de checkbox
        .map(th => th.textContent.trim());
    
    // Filtrar solo columnas de meses (excluir "Entidad" y "Total")
    const indicesMeses = [];
    const etiquetasMeses = [];
    encabezados.forEach((enc, idx) => {
        if (idx > 0 && idx < encabezados.length - 1) {
            indicesMeses.push(idx + 1);
            etiquetasMeses.push(enc);
        }
    });
    
    // Extraer datos de cada entidad seleccionada
    const datasets = [];
    entidadesSeleccionadas.forEach((entidad, colorIndex) => {
        const filas = Array.from(tabla.querySelectorAll('tbody tr'));
        const filaEntidad = filas.find(fila => {
            const nombreCelda = fila.cells[1];
            return nombreCelda && nombreCelda.textContent.trim() === entidad;
        });
        
        if (filaEntidad) {
            const datosMensuales = indicesMeses.map(idx => {
                const valor = filaEntidad.cells[idx]?.textContent.trim() || '0';
                return parseInt(valor) || 0;
            });
            
            const color = generarColorEntidad(colorIndex);
            
            // Dataset de la línea principal
            datasets.push({
                label: entidad,
                data: datosMensuales,
                borderColor: color,
                backgroundColor: color,
                borderWidth: 3,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.1,
                fill: false
            });
            
            // Dataset de la línea de tendencia
            const tendencia = calcularRegresionLineal(datosMensuales);
            datasets.push({
                label: `Lineal (${entidad})`,
                data: tendencia,
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
                tension: 0,
                fill: false
            });
        }
    });
    
    // Destruir gráfica anterior si existe
    if (graficaLineal2026Instance) {
        graficaLineal2026Instance.destroy();
    }
    
    // Crear gráfica
    const ctx = document.getElementById('graficaLineal2026');
    if (!ctx) return;
    
    graficaLineal2026Instance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: etiquetasMeses,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2.5,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 8,
                        font: {
                            size: 10
                        },
                        pointStyle: 'circle',
                        pointStyleWidth: 8
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += Math.round(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                datalabels: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: false
                    }
                },
                x: {
                    title: {
                        display: false
                    }
                }
            }
        }
    });
}
