// ===== TABLA JERÁRQUICA DE EVENTOS =====

const URL_GEORREF = 'https://docs.google.com/spreadsheets/d/1I6eGs9L4vICNaIAxr2yJi7953ch6fUyIRV-G-EHdI78/export?format=csv&gid=594361153';

let datosGEORREF = [];
let tablaJerarquicaData = {};
let años = []; // Array de años disponibles

// Cargar datos de GEORREF
async function cargarDatosGEORREF() {
    try {
        console.log('🔄 Cargando datos de GEORREF...');
        const response = await fetch(URL_GEORREF);
        const csvText = await response.text();
        
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        datosGEORREF = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            datosGEORREF.push(row);
        }
        
        console.log(`✅ ${datosGEORREF.length} registros cargados de GEORREF`);
        return datosGEORREF;
        
    } catch (error) {
        console.error('❌ Error cargando datos de GEORREF:', error);
        return [];
    }
}

// Procesar datos y crear estructura jerárquica
function procesarDatosJerarquicos(datos) {
    console.log('🔄 Procesando datos jerárquicos...');
    
    const estructura = {};
    
    datos.forEach(row => {
        const fecha = row.fecha;
        if (!fecha) return;
        
        // Parsear fecha (DD/MM/YYYY)
        const partes = fecha.split('/');
        if (partes.length !== 3) return;
        
        const dia = parseInt(partes[0]);
        const mes = parseInt(partes[1]);
        const año = parseInt(partes[2]);
        
        if (isNaN(dia) || isNaN(mes) || isNaN(año)) return;
        
        const zona = row.zona_geografica || 'Sin zona';
        const municipio = row.municipio || 'Sin municipio';
        const colonia = row.colonia || 'Sin colonia';
        
        // Crear estructura jerárquica
        if (!estructura[zona]) {
            estructura[zona] = {
                total: 0,
                municipios: {}
            };
        }
        
        if (!estructura[zona].municipios[municipio]) {
            estructura[zona].municipios[municipio] = {
                total: 0,
                colonias: {}
            };
        }
        
        if (!estructura[zona].municipios[municipio].colonias[colonia]) {
            estructura[zona].municipios[municipio].colonias[colonia] = {
                total: 0,
                años: {}
            };
        }
        
        const coloniaData = estructura[zona].municipios[municipio].colonias[colonia];
        
        // Crear estructura de año/mes (SIN DÍAS)
        if (!coloniaData.años[año]) {
            coloniaData.años[año] = {
                total: 0,
                meses: {}
            };
        }
        
        if (!coloniaData.años[año].meses[mes]) {
            coloniaData.años[año].meses[mes] = 0;
        }
        
        // Incrementar contadores
        coloniaData.años[año].meses[mes]++;
        coloniaData.años[año].total++;
        coloniaData.total++;
        estructura[zona].municipios[municipio].total++;
        estructura[zona].total++;
    });
    
    console.log('✅ Datos procesados:', estructura);
    return estructura;
}

// Nombres de meses
const NOMBRES_MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Generar HTML de la tabla
function generarTablaHTML(estructura) {
    console.log('🔄 Generando HTML de tabla...');
    
    // Obtener todos los años únicos y ordenarlos
    const añosSet = new Set();
    Object.values(estructura).forEach(zona => {
        Object.values(zona.municipios).forEach(municipio => {
            Object.values(municipio.colonias).forEach(colonia => {
                Object.keys(colonia.años).forEach(año => añosSet.add(parseInt(año)));
            });
        });
    });
    años = Array.from(añosSet).sort((a, b) => a - b);
    
    // FILA 1: Años
    let fila1 = '<tr class="header-row-years"><th class="col-fija" rowspan="2">Ubicación</th>';
    años.forEach(año => {
        fila1 += `<th class="header-year" id="year-header-${año}" data-year="${año}" data-expanded="false">${año}</th>`;
    });
    fila1 += '<th class="total-column" rowspan="2">Total General</th></tr>';
    
    // FILA 2: Meses (inicialmente con placeholders)
    let fila2 = '<tr class="header-row-months">';
    años.forEach(año => {
        fila2 += `<th class="header-month-placeholder" id="month-placeholder-${año}" data-year="${año}"></th>`;
    });
    fila2 += '</tr>';
    
    const thead = fila1 + fila2;
    
    // Generar filas de datos
    let tbody = '';
    let rowId = 0;
    
    // Ordenar zonas alfabéticamente
    const zonasOrdenadas = Object.keys(estructura).sort();
    
    zonasOrdenadas.forEach(zonaNombre => {
        const zona = estructura[zonaNombre];
        const zonaId = `zona-${rowId++}`;
        
        // Fila de zona
        tbody += `<tr class="nivel-zona" data-id="${zonaId}" data-zona="${zonaNombre}">`;
        tbody += `<td class="col-ubicacion"><span class="toggle-icon">⊕</span>${zonaNombre}</td>`;
        
        años.forEach(año => {
            const totalAño = calcularTotalAño(zona, año);
            tbody += `<td class="year-cell" id="year-cell-${zonaId}-${año}" data-year="${año}" data-row-id="${zonaId}">${totalAño}</td>`;
        });
        
        tbody += `<td class="total-column">${zona.total}</td></tr>`;
        
        // Municipios de esta zona - ORDENADOS POR TOTAL DESCENDENTE
        const municipiosOrdenados = Object.entries(zona.municipios)
            .sort((a, b) => b[1].total - a[1].total)
            .map(entry => entry[0]);
        
        municipiosOrdenados.forEach(municipioNombre => {
            const municipio = zona.municipios[municipioNombre];
            const municipioId = `municipio-${rowId++}`;
            
            tbody += `<tr class="nivel-municipio collapsed" data-parent="${zonaId}" data-id="${municipioId}" data-zona="${zonaNombre}" data-municipio="${municipioNombre}">`;
            tbody += `<td class="col-ubicacion"><span class="toggle-icon">⊕</span>${municipioNombre}</td>`;
            
            años.forEach(año => {
                const totalAño = calcularTotalAñoMunicipio(municipio, año);
                tbody += `<td class="year-cell" id="year-cell-${municipioId}-${año}" data-year="${año}" data-row-id="${municipioId}">${totalAño}</td>`;
            });
            
            tbody += `<td class="total-column">${municipio.total}</td></tr>`;
            
            // Colonias de este municipio - ORDENADAS POR TOTAL DESCENDENTE
            const coloniasOrdenadas = Object.entries(municipio.colonias)
                .sort((a, b) => b[1].total - a[1].total)
                .map(entry => entry[0]);
            
            coloniasOrdenadas.forEach(coloniaNombre => {
                const colonia = municipio.colonias[coloniaNombre];
                const coloniaId = `colonia-${rowId++}`;
                
                tbody += `<tr class="nivel-colonia collapsed" data-parent="${municipioId}" data-id="${coloniaId}" data-zona="${zonaNombre}" data-municipio="${municipioNombre}" data-colonia="${coloniaNombre}">`;
                tbody += `<td class="col-ubicacion">${coloniaNombre}</td>`;
                
                años.forEach(año => {
                    const totalAño = colonia.años[año] ? colonia.años[año].total : 0;
                    tbody += `<td class="year-cell" id="year-cell-${coloniaId}-${año}" data-year="${año}" data-row-id="${coloniaId}">${totalAño}</td>`;
                });
                
                tbody += `<td class="total-column">${colonia.total}</td></tr>`;
            });
        });
    });
    
    return { thead, tbody };
}

// Funciones auxiliares para calcular totales
function calcularTotalAño(zona, año) {
    let total = 0;
    Object.values(zona.municipios).forEach(municipio => {
        Object.values(municipio.colonias).forEach(colonia => {
            if (colonia.años[año]) {
                total += colonia.años[año].total;
            }
        });
    });
    return total;
}

function calcularTotalAñoMunicipio(municipio, año) {
    let total = 0;
    Object.values(municipio.colonias).forEach(colonia => {
        if (colonia.años[año]) {
            total += colonia.años[año].total;
        }
    });
    return total;
}

// Expandir/contraer año para mostrar meses
function toggleAño(año) {
    console.log(`🔄 Toggle año: ${año}`);
    
    const yearHeader = document.getElementById(`year-header-${año}`);
    const monthPlaceholder = document.getElementById(`month-placeholder-${año}`);
    
    console.log(`  yearHeader:`, yearHeader);
    console.log(`  monthPlaceholder:`, monthPlaceholder);
    
    if (!yearHeader) {
        console.error(`❌ No se encontró yearHeader para año ${año}`);
        return;
    }
    
    if (!monthPlaceholder) {
        console.warn(`⚠️ No se encontró monthPlaceholder para año ${año} (puede estar expandido)`);
    }
    
    const isExpanded = yearHeader.getAttribute('data-expanded') === 'true';
    console.log(`  Estado actual: ${isExpanded ? 'EXPANDIDO' : 'CONTRAÍDO'}`);
    console.log(`  data-expanded attribute:`, yearHeader.getAttribute('data-expanded')); 
    
    if (isExpanded) {
        console.log(`⊖ Contrayendo año ${año}`);
        // Contraer
        
        // 1. Restaurar header del año
        yearHeader.removeAttribute('colspan');
        yearHeader.setAttribute('data-expanded', 'false');
        // Icono eliminado - ya no es necesario
        
        // 2. Eliminar todos los headers de meses
        const monthHeaders = document.querySelectorAll(`th.header-month[data-year="${año}"]`);
        console.log(`  Eliminando ${monthHeaders.length} headers de meses`);
        monthHeaders.forEach(el => el.remove());
        
        // 3. Restaurar placeholder en la fila de meses
        const monthsRow = document.querySelector('.header-row-months');
        const newPlaceholder = document.createElement('th');
        newPlaceholder.className = 'header-month-placeholder';
        newPlaceholder.id = `month-placeholder-${año}`;
        newPlaceholder.setAttribute('data-year', año);
        
        // Encontrar la posición correcta para insertar el placeholder
        const yearIndex = años.indexOf(año);
        
        if (yearIndex < años.length - 1) {
            // No es el último año, insertar antes del siguiente año
            const nextYear = años[yearIndex + 1];
            const nextYearElement = monthsRow.querySelector(`[data-year="${nextYear}"]`);
            if (nextYearElement) {
                nextYearElement.before(newPlaceholder);
            } else {
                monthsRow.appendChild(newPlaceholder);
            }
        } else {
            // Es el último año, agregar al final
            monthsRow.appendChild(newPlaceholder);
        }
        
        // 4. Restaurar celdas del año en tbody (eliminar celdas de meses y crear celda de año)
        restaurarCeldasAño(año);
        
        console.log(`✅ Año ${año} contraído correctamente`);
        
    } else {
        console.log(`⊕ Expandiendo año ${año}`);
        // Expandir
        
        // 1. Expandir header del año
        yearHeader.setAttribute('colspan', '12');
        yearHeader.setAttribute('data-expanded', 'true');
        // Icono eliminado - ya no es necesario
        
        // 2. Crear fragment para los 12 meses
        const monthFragment = document.createDocumentFragment();
        for (let mes = 1; mes <= 12; mes++) {
            const mesHeader = document.createElement('th');
            mesHeader.className = 'header-month';
            mesHeader.id = `month-header-${año}-${mes}`;
            mesHeader.setAttribute('data-year', año);
            mesHeader.setAttribute('data-mes', mes);
            mesHeader.textContent = NOMBRES_MESES[mes - 1];
            monthFragment.appendChild(mesHeader);
        }
        
        // 3. Reemplazar placeholder con los 12 meses
        monthPlaceholder.replaceWith(monthFragment);
        
        // 4. Reemplazar celdas del año con columnas de meses en tbody
        reemplazarCeldasAñoConMeses(año);
        
        console.log(`✅ Año ${año} expandido correctamente`);
    }
}

// Reemplazar celdas del año con 12 celdas de meses
function reemplazarCeldasAñoConMeses(año) {
    const tbody = document.querySelector('#tablaJerarquica tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const zonaNombre = row.getAttribute('data-zona');
        const municipioNombre = row.getAttribute('data-municipio');
        const coloniaNombre = row.getAttribute('data-colonia');
        const rowId = row.getAttribute('data-id');
        
        // Encontrar la celda del año
        const yearCell = row.querySelector(`td.year-cell[data-year="${año}"]`);
        if (!yearCell) return;
        
        // Guardar el total del año como atributo antes de reemplazar
        const totalAño = yearCell.textContent;
        yearCell.setAttribute('data-total-año', totalAño);
        
        // Obtener datos según el nivel
        let datosAño = null;
        
        if (coloniaNombre) {
            // Es una colonia
            const coloniaData = tablaJerarquicaData[zonaNombre]?.municipios[municipioNombre]?.colonias[coloniaNombre];
            datosAño = coloniaData?.años[año];
        } else if (municipioNombre) {
            // Es un municipio - calcular totales
            const municipioData = tablaJerarquicaData[zonaNombre]?.municipios[municipioNombre];
            if (municipioData) {
                datosAño = { meses: {} };
                Object.values(municipioData.colonias).forEach(colonia => {
                    if (colonia.años[año]) {
                        Object.entries(colonia.años[año].meses).forEach(([mes, count]) => {
                            if (!datosAño.meses[mes]) {
                                datosAño.meses[mes] = 0;
                            }
                            datosAño.meses[mes] += count;
                        });
                    }
                });
            }
        } else if (zonaNombre) {
            // Es una zona - calcular totales
            const zonaData = tablaJerarquicaData[zonaNombre];
            if (zonaData) {
                datosAño = { meses: {} };
                Object.values(zonaData.municipios).forEach(municipio => {
                    Object.values(municipio.colonias).forEach(colonia => {
                        if (colonia.años[año]) {
                            Object.entries(colonia.años[año].meses).forEach(([mes, count]) => {
                                if (!datosAño.meses[mes]) {
                                    datosAño.meses[mes] = 0;
                                }
                                datosAño.meses[mes] += count;
                            });
                        }
                    });
                });
            }
        }
        
        // Crear la primera celda de mes (Enero)
        const primerMesCell = document.createElement('td');
        primerMesCell.className = 'month-cell';
        primerMesCell.setAttribute('data-year', año);
        primerMesCell.setAttribute('data-mes', '1');
        primerMesCell.id = `month-cell-${rowId}-${año}-1`;
        
        let totalMes1 = 0;
        if (datosAño && datosAño.meses[1]) {
            totalMes1 = datosAño.meses[1];
        }
        primerMesCell.textContent = totalMes1;
        
        // Reemplazar la celda del año con la primera celda de mes
        yearCell.replaceWith(primerMesCell);
        
        // Crear las 11 celdas restantes (Febrero a Diciembre)
        for (let mes = 2; mes <= 12; mes++) {
            const mesCell = document.createElement('td');
            mesCell.className = 'month-cell';
            mesCell.setAttribute('data-year', año);
            mesCell.setAttribute('data-mes', mes.toString());
            mesCell.id = `month-cell-${rowId}-${año}-${mes}`;
            
            let totalMes = 0;
            if (datosAño && datosAño.meses[mes]) {
                totalMes = datosAño.meses[mes];
            }
            
            mesCell.textContent = totalMes;
            
            // Insertar después de la celda anterior
            const prevMesCell = row.querySelector(`td.month-cell[data-year="${año}"][data-mes="${mes - 1}"]`);
            if (prevMesCell) {
                prevMesCell.after(mesCell);
            }
        }
    });
}

// Restaurar celdas del año (eliminar meses y crear celda de año)
function restaurarCeldasAño(año) {
    const tbody = document.querySelector('#tablaJerarquica tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const zonaNombre = row.getAttribute('data-zona');
        const municipioNombre = row.getAttribute('data-municipio');
        const coloniaNombre = row.getAttribute('data-colonia');
        const rowId = row.getAttribute('data-id');
        
        // Encontrar la primera celda de mes de este año
        const firstMonthCell = row.querySelector(`td.month-cell[data-year="${año}"][data-mes="1"]`);
        if (!firstMonthCell) return;
        
        // Calcular el total del año
        let totalAño = 0;
        
        if (coloniaNombre) {
            const coloniaData = tablaJerarquicaData[zonaNombre]?.municipios[municipioNombre]?.colonias[coloniaNombre];
            totalAño = coloniaData?.años[año]?.total || 0;
        } else if (municipioNombre) {
            const municipioData = tablaJerarquicaData[zonaNombre]?.municipios[municipioNombre];
            if (municipioData) {
                Object.values(municipioData.colonias).forEach(colonia => {
                    if (colonia.años[año]) {
                        totalAño += colonia.años[año].total;
                    }
                });
            }
        } else if (zonaNombre) {
            const zonaData = tablaJerarquicaData[zonaNombre];
            if (zonaData) {
                Object.values(zonaData.municipios).forEach(municipio => {
                    Object.values(municipio.colonias).forEach(colonia => {
                        if (colonia.años[año]) {
                            totalAño += colonia.años[año].total;
                        }
                    });
                });
            }
        }
        
        // Crear nueva celda del año
        const yearCell = document.createElement('td');
        yearCell.className = 'year-cell';
        yearCell.setAttribute('data-year', año);
        yearCell.setAttribute('data-row-id', rowId);
        yearCell.id = `year-cell-${rowId}-${año}`;
        yearCell.textContent = totalAño;
        
        // Reemplazar la primera celda de mes con la celda del año
        firstMonthCell.replaceWith(yearCell);
        
        // Eliminar las 11 celdas restantes de meses
        for (let mes = 2; mes <= 12; mes++) {
            const mesCell = row.querySelector(`td.month-cell[data-year="${año}"][data-mes="${mes}"]`);
            if (mesCell) {
                mesCell.remove();
            }
        }
    });
}

// Inicializar tabla jerárquica
async function inicializarTablaJerarquica() {
    console.log('🚀 Inicializando tabla jerárquica...');
    
    const datos = await cargarDatosGEORREF();
    
    if (datos.length === 0) {
        document.getElementById('tablaJerarquicaLoading').innerHTML = '<p>❌ Error al cargar datos</p>';
        return;
    }
    
    tablaJerarquicaData = procesarDatosJerarquicos(datos);
    const { thead, tbody } = generarTablaHTML(tablaJerarquicaData);
    
    // Insertar en la tabla
    const tabla = document.getElementById('tablaJerarquica');
    tabla.querySelector('thead').innerHTML = thead;
    tabla.querySelector('tbody').innerHTML = tbody;
    
    // Ocultar loading, mostrar tabla
    document.getElementById('tablaJerarquicaLoading').style.display = 'none';
    document.getElementById('tablaJerarquicaWrapper').style.display = 'block';
    
    // Agregar eventos de click
    agregarEventosToggle();
    
    console.log('✅ Tabla jerárquica inicializada');
    console.log(`📊 Años disponibles: ${años.join(', ')}`);
}

// Agregar eventos para contraer/desplegar
function agregarEventosToggle() {
    // Eventos para zonas
    document.querySelectorAll('.nivel-zona').forEach(row => {
        row.addEventListener('click', function(e) {
            // Evitar que el click en la celda del año active el toggle de zona
            if (e.target.closest('.year-cell') || e.target.closest('.month-cell')) return;
            
            const id = this.getAttribute('data-id');
            const hijos = document.querySelectorAll(`[data-parent="${id}"]`);
            const icon = this.querySelector('.toggle-icon');
            
            hijos.forEach(hijo => {
                hijo.classList.toggle('collapsed');
            });
            
            icon.textContent = icon.textContent === '⊕' ? '⊖' : '⊕';
        });
    });
    
    // Eventos para municipios
    document.querySelectorAll('.nivel-municipio').forEach(row => {
        row.addEventListener('click', function(e) {
            // Evitar que el click en la celda del año active el toggle de municipio
            if (e.target.closest('.year-cell') || e.target.closest('.month-cell')) return;
            
            const id = this.getAttribute('data-id');
            const hijos = document.querySelectorAll(`[data-parent="${id}"]`);
            const icon = this.querySelector('.toggle-icon');
            
            hijos.forEach(hijo => {
                hijo.classList.toggle('collapsed');
            });
            
            icon.textContent = icon.textContent === '⊕' ? '⊖' : '⊕';
        });
    });
    
    // Eventos para headers de año
    document.querySelectorAll('.header-year').forEach(header => {
        const año = parseInt(header.getAttribute('data-year'));
        console.log(`✓ Event listener agregado para año ${año}`);
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleAño(año);
        });
    });
}

// Inicializar cuando se active la pestaña de Carpetas
let tablaJerarquicaInicializada = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ tabla-jerarquica.js cargado');
    
    // Esperar a que se active la pestaña de Carpetas
    const tabCarpetas = document.querySelector('[data-tab="carpetas"]');
    if (tabCarpetas) {
        tabCarpetas.addEventListener('click', function() {
            console.log('🔄 Pestaña Carpetas activada');
            // Inicializar solo una vez
            if (!tablaJerarquicaInicializada) {
                tablaJerarquicaInicializada = true;
                setTimeout(() => {
                    inicializarTablaJerarquica();
                }, 500);
            }
        });
    } else {
        console.log('⚠️ No se encontró el botón de pestaña Carpetas');
    }
});

