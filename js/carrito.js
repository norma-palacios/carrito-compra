// Aquí se manejará el carrito: agregar y eliminar productos
let carrito = [];

// Agregar producto al carrito
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const inputCantidad = document.getElementById(`cantidad-${id}`);
  const cantidad = parseInt(inputCantidad.value);

  if (cantidad > 0 && cantidad <= producto.stock) {
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
  } else {
    alert("Cantidad no válida o sin stock suficiente.");
  }
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
  const item = carrito.find(p => p.id === id);
  if (item) {
    const producto = productos.find(p => p.id === id);
    producto.stock += item.cantidad; // devolver stock
    carrito = carrito.filter(p => p.id !== id); // quitar del carrito
    mostrarProductos();
    mostrarCarrito();
  } else {
    alert("El producto no está en el carrito.");
  }
}

// Mostrar el carrito en pantalla
function mostrarCarrito() {
  const contenedor = document.getElementById("lista-carrito");
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    contenedor.innerHTML = "<p>El carrito está vacío.</p>";
    return;
  }

  carrito.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item-carrito");

    div.innerHTML = `
      <p>${item.nombre} - Cantidad: ${item.cantidad} - Subtotal: $${item.cantidad * item.precio}</p>
    `;

    contenedor.appendChild(div);
  });
}
