const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 8080;

// Configuración de Handlebars
app.engine('handlebars', exphbs({
  defaultLayout: 'main'  // Especificamos el layout predeterminado
}));
app.set('view engine', 'handlebars');

// Archivos estáticos (por ejemplo, imágenes, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de WebSocket
const server = http.createServer(app);
const io = socketIo(server); // Usamos socket.io para habilitar websockets

// Configuración de body-parser para poder leer datos JSON en las peticiones POST
app.use(express.json());

// Rutas de productos (puedes adaptar tus rutas como las tenías antes)
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Renderización de la vista raíz
app.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los productos' });

    const products = JSON.parse(data);
    res.render('home', { title: 'Lista de Productos', products });
  });
});

// Renderización de la vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los productos' });

    const products = JSON.parse(data);
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
  });
});

// Conexión de WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Enviar la lista de productos cuando un cliente se conecta
  fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8', (err, data) => {
    if (err) return;

    const products = JSON.parse(data);
    socket.emit('updateProducts', products); // Emitir productos a los clientes conectados
  });

  // Evento de desconexión
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Servidor corriendo
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
