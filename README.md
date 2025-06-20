# Generador de Códigos de Barra ISBN

Una aplicación web para generar y gestionar códigos de barra EAN-13 para números ISBN. La aplicación permite generar códigos de barra únicos, validar ISBNs, y gestionar una colección de códigos generados.

Preview: [AQUÍ](https://englishbook-barcodes.netlify.app/)

## Características

- 🎯 Generación de códigos de barra EAN-13 para ISBN
- 🔄 Generación automática de ISBNs únicos
- ✅ Validación automática del dígito de control EAN-13
- 💾 Almacenamiento local de códigos generados
- 📱 Diseño responsive
- 📋 Tabla de gestión de códigos generados
- 📥 Descarga de códigos de barra como imágenes
- 📋 Copia de códigos de barra al portapapeles
- 🎨 Interfaz moderna y fácil de usar

## Tecnologías Utilizadas

- **Frontend**:
  - HTML5
  - CSS3 (con diseño responsive)
  - JavaScript (ES6+)
  - [JsBarcode](https://github.com/lindell/JsBarcode) - Biblioteca para generación de códigos de barra
  - [Font Awesome](https://fontawesome.com/) - Iconos

## Características Técnicas

### Validación de ISBN
- Implementa el algoritmo estándar de validación EAN-13
- Verifica el dígito de control
- Permite corrección automática del dígito de control

### Generación de ISBN Único
- Combina timestamp y números aleatorios
- Verifica unicidad antes de generar
- Implementa sistema de reintentos para evitar colisiones

### Almacenamiento
- Utiliza localStorage para persistencia de datos
- Mantiene un registro de ISBNs únicos
- Almacena título, ISBN y timestamp de generación

### Interfaz de Usuario
- Diseño responsive que se adapta a diferentes dispositivos
- Tabla con ordenamiento por fecha (más recientes primero)
- Botones de acción intuitivos
- Feedback visual con spinners y mensajes de estado

## Cómo Usar

1. **Generar un ISBN**:
   - Ingresa manualmente un ISBN de 13 dígitos, o
   - Usa el botón de generación aleatoria

2. **Ingresar Título**:
   - Proporciona un título descriptivo para el código

3. **Generar Código**:
   - Haz clic en "Generar Código"
   - Espera el proceso de generación (2 segundos)

4. **Gestionar Códigos**:
   - Los códigos generados aparecerán en la tabla
   - Usa el botón "Descargar" para guardar la imagen
   - Usa el botón "Copiar" para copiar la imagen al portapapeles

## Requisitos del Sistema

- Navegador web moderno con soporte para:
  - JavaScript ES6+
  - Canvas API
  - localStorage
  - Clipboard API (para copiar imágenes)

## Limitaciones Conocidas

- La copia de imágenes al portapapeles puede no funcionar en todos los navegadores
- El almacenamiento en localStorage tiene un límite de tamaño
- La generación de ISBNs únicos tiene un límite de intentos para evitar bucles infinitos

## Mejoras Futuras

- [ ] Implementar sistema de categorías para los códigos
- [ ] Añadir búsqueda y filtrado en la tabla
- [ ] Implementar exportación de datos en diferentes formatos
- [ ] Añadir soporte para otros tipos de códigos de barra
- [ ] Implementar sistema de respaldo de datos

## Contribuir

Las contribuciones son bienvenidas. Por favor, asegúrate de:

1. Hacer fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Si tienes preguntas o sugerencias, por favor abre un issue en el repositorio.
