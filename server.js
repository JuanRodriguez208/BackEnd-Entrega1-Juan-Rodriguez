const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 8080;

app.engine('handlebars', exphbs({
  defaultLayout: 'main' 
}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIo(server); 

app.use(express.json());

const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los productos' });

    const products = JSON.parse(data);
    res.render('home', { title: 'Lista de Productos', products });
  });
});

app.get('/realtimeproducts', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer los productos' });

    const products = JSON.parse(data);
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
  });
});

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf-8', (err, data) => {
    if (err) return;

    const products = JSON.parse(data);
    socket.emit('updateProducts', products);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
