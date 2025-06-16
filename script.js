// Funciones globales para las acciones
function downloadBarcode(imgElement, title) {
    const link = document.createElement('a');
    link.download = `barcode-${title}.png`;
    link.href = imgElement.src;
    link.click();
}

function copyToClipboard(text) {
    // Crear un elemento temporal
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Hacer el elemento invisible
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    
    // Seleccionar y copiar el texto
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('ISBN copiado al portapapeles');
        } else {
            alert('No se pudo copiar el ISBN');
        }
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('Error al copiar el ISBN');
    }
    
    // Limpiar
    document.body.removeChild(textArea);
}

document.addEventListener('DOMContentLoaded', () => {
    const isbnInput = document.getElementById('isbn');
    const titleInput = document.getElementById('title');
    const generateBtn = document.getElementById('generateBtn');
    const randomIsbnBtn = document.getElementById('randomIsbnBtn');
    const codesTableBody = document.getElementById('codesTableBody');
    const btnText = document.querySelector('.btn-text');
    const spinner = document.querySelector('.spinner');

    // Cargar datos guardados al iniciar
    loadSavedData();

    // Validar que el ISBN solo contenga números
    isbnInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Función para generar un ISBN aleatorio
    function generateRandomISBN() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const first12 = timestamp.slice(-9) + random;
        const checkDigit = calculateCheckDigit(first12);
        return first12 + checkDigit;
    }

    // Manejador del botón de ISBN aleatorio
    randomIsbnBtn.addEventListener('click', () => {
        isbnInput.value = generateRandomISBN();
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
                        <i class="fas fa-download"></i> Descargar
                    </button>
                    <button class="copy-btn" onclick="copyToClipboard('${isbn}')">
                        <i class="fas fa-copy"></i> Copiar
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
}); 