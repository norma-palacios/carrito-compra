// Aquí se manejará el carrito: agregar y eliminar productos
let carrito = [];

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

  // Se inyecta el botón para vaciar el carrito
  const actions = document.createElement("div");
  actions.classList.add("acciones-carrito");
  actions.innerHTML = `<button class="btn-vaciar" onclick="vaciarCarrito()">Vaciar carrito</button>`;
  contenedor.appendChild(actions);
}
