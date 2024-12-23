const express = require('express');
const bodyParser = require('body-parser');  // No es necesario si usas express.json()
const app = express();
const port = 8080;

// Middleware para procesar JSON en las solicitudes
app.use(express.json());  // Habilita el procesamiento de cuerpos JSON en las peticiones

// Importar las rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');  // Debes agregar esta ruta también

// Usar las rutas en el servidor
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);  // Asegúrate de tener esta línea para los carritos

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
