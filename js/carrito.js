    // Aquí se manejará el carrito: agregar y eliminar productos
let carrito = [];
function descargarFacturaJSON() {
  const { subtotal, impuesto, total } = resumenCompra(carrito);
  const factura = {
    fecha: new Date().toISOString(),
    moneda: 'USD',
    iva: TAX_RATE,
    items: carrito.map(it => ({
      id: it.id,
      nombre: it.nombre,
      cantidad: Number(it.cantidad),
      precioUnitario: Number(it.precio),
      subtotal: Number((it.cantidad * it.precio).toFixed(2)),
    })),
    totales: { subtotal, impuesto, total }
  };
  const blob = new Blob([JSON.stringify(factura, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `factura_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Generar  PDF de factura
function descargarFacturaPDF() {
    const el = document.querySelector('#factura-print');
    if (!el) return;
    const nombre = `factura_${new Date().toISOString().slice(0, 10)}.pdf`;
    const opt = {
        margin: 10,
        filename: nombre,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },       // buena calidad
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(el).set(opt).save();
}
// Gernera DOCX de facttura
function descargarFacturaDOCX() {
    const el = document.querySelector('#factura-print');
    if (!window.docx) { alert('Librería DOCX no cargada'); return; }
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun } = docx;

    const { subtotal, impuesto, total } = resumenCompra(carrito);

    // Filas de tabla
    const header = new TableRow({
        children: ['Producto', 'Cant.', 'Unit.', 'Subtotal'].map(t =>
            new TableCell({ children: [new Paragraph({ text: t, bold: true })] }))
    });

    const rows = carrito.map(it => new TableRow({
        children: [
            new TableCell({ children: [new Paragraph(it.nombre)] }),
            new TableCell({ children: [new Paragraph(String(it.cantidad))] }),
            new TableCell({ children: [new Paragraph(`$${formatoPrecio(it.precio)}`)] }),
            new TableCell({ children: [new Paragraph(`$${formatoPrecio(it.cantidad * it.precio)}`)] }),
        ]
    }));

    const tabla = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [header, ...rows],
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({ text: 'Factura', heading: 'Heading1' }),
                tabla,
                new Paragraph({ text: '' }),
                new Paragraph({ text: `Subtotal: $${formatoPrecio(subtotal)}`, alignment: AlignmentType.RIGHT }),
                new Paragraph({ text: `Impuesto (${(TAX_RATE * 100).toFixed(0)}%): $${formatoPrecio(impuesto)}`, alignment: AlignmentType.RIGHT }),
                new Paragraph({ text: `Total: $${formatoPrecio(total)}`, bold: true, alignment: AlignmentType.RIGHT }),
            ],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `factura_${new Date().toISOString().slice(0, 10)}.docx`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
}

// Aqui iria la funcion quue generaria el JSON para integrar con backende

// Agregar producto al carrito
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const inputCantidad = document.getElementById(`cantidad-${id}`);
  const cantidad = parseInt(inputCantidad?.value, 10);

  // Validaciones
  if (!producto || isNaN(cantidad) || cantidad <= 0) {
    alert("La cantidad debe ser un entero mayor o igual a 1.");
    return;
  }
  if (cantidad > producto.stock) {
    alert("Cantidad no válida o sin stock suficiente.");
    return;
  }

  // Buscar si ya está en el carrito
  const item = carrito.find(p => p.id === id);

  if (item) {
    item.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  producto.stock -= cantidad; // Reducir stock disponible
  mostrarProductos(); // refrescar productos
  mostrarCarrito();
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
  const item = carrito.find(p => p.id === id);
  if (item) {
    const producto = productos.find(p => p.id === id);
    if (producto) producto.stock += item.cantidad; // devolver stock
    carrito = carrito.filter(p => p.id !== id); // quitar del carrito
    mostrarProductos();
    mostrarCarrito();
  } else {
    alert("El producto no está en el carrito.");
  }
}

// Vaciar carrito y devolver todo el stock
function vaciarCarrito() {
  if (!carrito.length) return;
  carrito.forEach(it => {
    const prod = productos.find(p => p.id === it.id);
    if (prod) prod.stock += it.cantidad;
  });
  carrito = [];
  mostrarProductos();
  mostrarCarrito();
}
const fmtUSD = new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' });// Formteador de moneda mas robusto
//sirve para devolver {items, total} sin tocar el DOM
function ObtenerTotales(arr) {
    return arr.reduce((acc, it) => {
        acc.items += Number(it.cantidad) || 0;
        acc.total += (Number(it.cantidad) || 0) * (Number(it.precio) || 0);//separar el calculo de pintado efecto/DOM
        return acc;
    }, { items: 0, total: 0 });
}
//  Config impuestos    
const TAX_RATE = 0.13; 

// Utilidades de totales puras
function resumenCompra(arr) {
    // subtotal, impuesto y total general
    const subtotal = arr.reduce((acc, it) => acc + (Number(it.cantidad) || 0) * (Number(it.precio) || 0), 0);
    const impuesto = +(subtotal * TAX_RATE).toFixed(2);
    const total = +(subtotal + impuesto).toFixed(2);
    return { subtotal, impuesto, total };
}

//  Modal helpers 
function abrirModalFactura(html) {
    const m = document.getElementById('modal-factura');
    const c = document.getElementById('factura-contenido');
    if (!m || !c) return;
    c.innerHTML = html;
    m.classList.remove('hidden');
}

function cerrarModalFactura() {
    const m = document.getElementById('modal-factura');
    if (m) m.classList.add('hidden');
}

// generar y mostrar la factura 
function confirmarCompra() {
    if (!carrito.length) {
        alert('Tu carrito está vacío.');
        return;
    }

    const { subtotal, impuesto, total } = resumenCompra(carrito);

    const filas = carrito.map(it => `
    <tr>
      <td>${it.nombre}</td>
      <td>${it.cantidad}</td>
      <td>$${formatoPrecio(it.precio)}</td>
      <td>$${formatoPrecio(it.cantidad * it.precio)}</td>
    </tr>
  `).join('');

    const html = `
    <div id="factura-print">
    <h2>Factura</h2>
    <table class="table-factura" aria-label="Detalle de la factura">
      <thead>
        <tr><th>Producto</th><th>Cant.</th><th>Unit.</th><th>Subtotal</th></tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>

    <div class="factura-totales">
      <div><strong>Subtotal:</strong> $${formatoPrecio(subtotal)}</div>
      <div><strong>Impuesto (${(TAX_RATE * 100).toFixed(0)}%):</strong> $${formatoPrecio(impuesto)}</div>
      <div><strong>Total:</strong> $${formatoPrecio(total)}</div>
    </div>
     

    <div class="factura-footer">
    <button class="btn" onclick="descargarFacturaPDF()">Descargar PDF</button>
    <button class="btn" onclick="descargarFacturaDOCX()">Descargar DOCX</button>
    <button class="btn" onclick="descargarFacturaJSON()">Descargar JSON</button>
    <button class="btn" onclick="cerrarModalFactura()">Seguir comprando</button>
    <button class="btn primary" onclick="finalizarCompra()">Finalizar compra</button>
  </div>
  `;

    abrirModalFactura(html);
}

//finalizar compra vaca y cierra
function finalizarCompra() {
    vaciarCarrito();           // devuelve stock y limpia el array
    cerrarModalFactura();
    alert('¡Gracias por tu compra!');
}

// Mostrar el carrito en pantalla
function mostrarCarrito() {
    const contenedor = document.getElementById("lista-carrito");
    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }
    let total = 0;
    carrito.forEach(item => {
        const subtotal = item.cantidad * item.precio;
        total += subtotal;

        const div = document.createElement("div");
        div.classList.add("item-carrito");

        div.innerHTML = `
      <p>${item.nombre} - Cantidad: ${item.cantidad} - Unit: $${formatoPrecio(item.precio)} - Subtotal: $${formatoPrecio(subtotal)}</p>
    `;

        contenedor.appendChild(div);
    });

    // Calculo de total general
    const totalDiv = document.createElement("div");
    totalDiv.classList.add("total");
    totalDiv.textContent = `Total: $${formatoPrecio(total)}`;
    contenedor.appendChild(totalDiv);

    // Acciones del carrito: Confirmar + Vaciar
    const actions = document.createElement("div");
    actions.classList.add("acciones-carrito");
    actions.style.display = "flex";
    actions.style.gap = ".5rem";
    actions.style.justifyContent = "flex-end";
    actions.innerHTML = `
    <button class="btn" onclick="vaciarCarrito()">Vaciar carrito</button>
    <button class="btn primary" onclick="confirmarCompra()">Confirmar compra</button> `;
    contenedor.appendChild(actions);
}





