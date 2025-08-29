// Lista de productos disponibles en la tienda
// Cada producto tiene: id, nombre, $precio y stock (cantidad disponible)

const productos = [
  { id: 1, nombre: "Laptop Lenovo", precio: 750, stock: 8 },
  { id: 2, nombre: "Mouse Gamer Logitech", precio: 35, stock: 25 },
  { id: 3, nombre: "Teclado Mecánico Redragon", precio: 55, stock: 15 },
  { id: 4, nombre: "Auriculares Inalámbricos Sony", precio: 120, stock: 10 },
  { id: 5, nombre: "Monitor Curvo Samsung 27''", precio: 300, stock: 5 }
];

function formatoPrecio(numero) {
  return Number(numero).toFixed(2);
}

// Renderizar los productos en pantalla
function mostrarProductos() {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = ""; // limpiar antes de volver a pintar

  // ...Si no hay productos
  if (!productos.length) {
    contenedor.innerHTML = "<p>No hay productos disponibles. Agrega productos.</p>";
    return;
  }

  productos.forEach(prod => {
    const div = document.createElement("div");
    div.classList.add("producto");
    const sinStock = prod.stock <= 0;

    div.innerHTML = `
      <h3>${prod.nombre} ${sinStock ? '<span class="sin-stock">sin stock</span>' : ''}</h3>
      <p>Precio: $${formatoPrecio(prod.precio)}</p>
      <p class="${sinStock ? 'estado-sin-stock' : ''}">Disponible: ${prod.stock}${sinStock ? ' (sin stock)' : ''}</p>
      <input type="number" id="cantidad-${prod.id}" min="1" max="${Math.max(prod.stock,1)}" value="1" ${sinStock ? 'disabled' : ''}>
      <button onclick="agregarAlCarrito(${prod.id})" ${sinStock ? 'disabled' : ''} title="${sinStock ? 'Sin stock' : ''}">Agregar</button>
      <button onclick="eliminarDelCarrito(${prod.id})">Eliminar</button>
    `;

    contenedor.appendChild(div);
  });
}

// Mostrar productos al cargar la página
document.addEventListener("DOMContentLoaded", mostrarProductos);
