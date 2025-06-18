// Funciones globales para las acciones
function downloadBarcode(imgElement, title) {
    const link = document.createElement('a');
    link.download = `barcode-${title}.png`;
    link.href = imgElement.src;
    link.click();
}

function copyToClipboard(imgElement) {
    try {
        // Crear un elemento temporal
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        
        // Clonar la imagen
        const imgClone = imgElement.cloneNode(true);
        tempDiv.appendChild(imgClone);
        document.body.appendChild(tempDiv);
        
        // Seleccionar la imagen
        const range = document.createRange();
        range.selectNode(imgClone);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Intentar copiar
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Imagen copiada al portapapeles');
        } else {
            alert('No se pudo copiar la imagen. Por favor, usa el botón de descarga.');
        }
        
        // Limpiar
        selection.removeAllRanges();
        document.body.removeChild(tempDiv);
    } catch (err) {
        console.error('Error al copiar la imagen:', err);
        alert('No se pudo copiar la imagen. Por favor, usa el botón de descarga.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const isbnInput = document.getElementById('isbn');
    const titleInput = document.getElementById('title');
    const generateBtn = document.getElementById('generateBtn');
    const randomIsbnBtn = document.getElementById('randomIsbnBtn');
    const exportBtn = document.getElementById('exportBtn');
    const codesTableBody = document.getElementById('codesTableBody');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');

    // Set para almacenar ISBNs únicos
    const usedISBNs = new Set();

    // Cargar datos guardados al iniciar
    loadSavedData();

    // Validar que el ISBN solo contenga números
    isbnInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Función para generar un ISBN aleatorio único
    function generateRandomISBN() {
        let isbn;
        let attempts = 0;
        const maxAttempts = 100; // Prevenir bucle infinito

        do {
            // Usar timestamp y números aleatorios para mayor unicidad
            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const first12 = timestamp.slice(-8) + random;
            const checkDigit = calculateCheckDigit(first12);
            isbn = first12 + checkDigit;
            attempts++;
        } while (usedISBNs.has(isbn) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            throw new Error('No se pudo generar un ISBN único después de varios intentos');
        }

        return isbn;
    }

    // Manejador del botón de ISBN aleatorio
    randomIsbnBtn.addEventListener('click', () => {
        try {
            const newISBN = generateRandomISBN();
            isbnInput.value = newISBN;
        } catch (error) {
            alert('Error al generar ISBN único. Por favor, intenta de nuevo.');
        }
    });

    // Función para calcular el dígito de control EAN-13
    function calculateCheckDigit(ean) {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(ean[i]) * (i % 2 === 0 ? 1 : 3);
        }
        return (10 - (sum % 10)) % 10;
    }

    // Función para validar el dígito de control EAN-13
    function validateEAN13(ean) {
        if (ean.length !== 13) return false;
        
        const checkDigit = calculateCheckDigit(ean);
        return checkDigit === parseInt(ean[12]);
    }

    // Función para corregir el ISBN
    function fixISBN(isbn) {
        if (isbn.length !== 13) return isbn;
        
        const first12 = isbn.substring(0, 12);
        const correctCheckDigit = calculateCheckDigit(first12);
        return first12 + correctCheckDigit;
    }

    // Función para validar el formulario
    function validateForm() {
        const isbn = isbnInput.value.trim();
        const title = titleInput.value.trim();

        if (isbn.length !== 13) {
            alert('El ISBN debe tener exactamente 13 dígitos');
            return false;
        }

        if (!validateEAN13(isbn)) {
            const correctISBN = fixISBN(isbn);
            const shouldFix = confirm(`El dígito de control no es válido. ¿Deseas corregirlo automáticamente a ${correctISBN}?`);
            
            if (shouldFix) {
                isbnInput.value = correctISBN;
                return true;
            }
            return false;
        }

        if (usedISBNs.has(isbn)) {
            alert('Este ISBN ya ha sido utilizado. Por favor, genera uno nuevo o usa otro.');
            return false;
        }

        if (!title) {
            alert('Por favor ingrese un título');
            return false;
        }

        return true;
    }

    // Función para generar el código de barra
    function generateBarcode(isbn) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, isbn, {
                format: "EAN13",
                width: 2,
                height: 80,
                displayValue: true,
                fontSize: 20,
                margin: 10,
                valid: (valid) => {
                    if (!valid) {
                        throw new Error('Código de barra inválido');
                    }
                }
            });
            resolve(canvas);
        });
    }

    // Función para guardar datos en localStorage
    function saveToLocalStorage(title, isbn, timestamp) {
        const savedData = JSON.parse(localStorage.getItem('barcodeData') || '[]');
        savedData.push({ title, isbn, timestamp });
        localStorage.setItem('barcodeData', JSON.stringify(savedData));
        usedISBNs.add(isbn); // Agregar ISBN al set de usados
    }

    // Función para cargar datos guardados
    function loadSavedData() {
        const savedData = JSON.parse(localStorage.getItem('barcodeData') || '[]');
        savedData.forEach(item => {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, item.isbn, {
                format: "EAN13",
                width: 2,
                height: 80,
                displayValue: true,
                fontSize: 20,
                margin: 10
            });
            addTableRow(item.title, item.isbn, canvas, item.timestamp);
            usedISBNs.add(item.isbn); // Agregar ISBN al set de usados
        });
    }

    // Función para agregar una nueva fila a la tabla
    function addTableRow(title, isbn, canvas, timestamp = new Date().toLocaleString()) {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${title}</td>
            <td>${isbn}</td>
            <td><img src="${canvas.toDataURL('image/png')}" alt="Barcode" class="qr-code"></td>
            <td>${timestamp}</td>
            <td>
                <div class="action-buttons">
                    <button class="download-btn" onclick="downloadBarcode(this.parentElement.parentElement.parentElement.querySelector('img'), '${title}')">
                        <i class="fas fa-download"></i> Descargar Imagen
                    </button>
                    <button class="copy-btn" onclick="copyToClipboard(this.parentElement.parentElement.parentElement.querySelector('img'))">
                        <i class="fas fa-copy"></i> Copiar Imagen
                    </button>
                </div>
            </td>
        `;

        codesTableBody.insertBefore(row, codesTableBody.firstChild);
    }

    // Manejador del botón de generación
    generateBtn.addEventListener('click', async () => {
        if (!validateForm()) return;

        // Mostrar spinner y deshabilitar botón
        btnText.textContent = 'Generando...';
        spinner.classList.remove('hidden');
        generateBtn.disabled = true;

        try {
            const isbn = isbnInput.value.trim();
            const title = titleInput.value.trim();
            const timestamp = new Date().toLocaleString();

            // Simular carga de 2 segundos
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generar código de barra
            const canvas = await generateBarcode(isbn);
            addTableRow(title, isbn, canvas, timestamp);
            
            // Guardar en localStorage
            saveToLocalStorage(title, isbn, timestamp);

            // Limpiar formulario
            isbnInput.value = '';
            titleInput.value = '';
        } catch (error) {
            console.error('Error al generar el código de barra:', error);
            alert('Hubo un error al generar el código de barra. Por favor, verifica que el ISBN sea válido.');
        } finally {
            // Restaurar botón
            btnText.textContent = 'Generar Código';
            spinner.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    // Función para exportar la tabla como HTML con imágenes embebidas
    function exportToExcel() {
        const rows = codesTableBody.querySelectorAll('tr');
        if (rows.length === 0) {
            alert('No hay códigos para exportar. Primero genera algunos códigos de barras.');
            return;
        }

        exportBtn.disabled = true;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exportando...';

        try {
            let htmlContent = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Códigos de Barras</title>
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        img { max-width: 200px; height: auto; }
                    </style>
                </head>
                <body>
                    <table>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>ISBN</th>
                                <th>Código de Barras</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            rows.forEach((row, i) => {
                const title = row.cells[0].textContent;
                const isbn = row.cells[1].textContent;
                const barcodeImg = row.cells[2].querySelector('img');
                htmlContent += `
                    <tr>
                        <td>${title}</td>
                        <td>${isbn}</td>
                        <td>${barcodeImg ? `<img src="${barcodeImg.src}" alt="Código de barras ${i + 1}">` : ''}</td>
                    </tr>
                `;
            });

            htmlContent += `
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const fileName = `codigos_barras_${new Date().toISOString().slice(0, 10)}.html`;
            saveAs(blob, fileName);

            setTimeout(() => {
                alert('¡Exportación completada! Abre el archivo HTML en Excel y guárdalo como .xlsx para mantener las imágenes.');
            }, 100);
        } catch (error) {
            alert('Error al exportar.');
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-excel"></i> Exportar Códigos';
        }
    }

    // Event listener para el botón de exportación
    exportBtn.addEventListener('click', exportToExcel);
}); 