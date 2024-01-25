const app = require('express')(); // servidor de aplicaciones
const http = require('http').createServer(app); // servidor HTTP
const io = require('socket.io')(http); // Importamos `socket.io`

const port = 3000; // El puerto
var clients = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client.html');
});

io.on('connection', socket => {
  console.log('a user connected');
  clients.push(socket); // metemos el socket en el array

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    clients.splice(clients.indexOf(socket), 1); // lo sacamos del array
  });

  socket.on('precios', mensaje => {
    let lista = 
        mensaje === 'armas' ?
           {espada: 400, escudo: 200} :
           {naranja: 10, limon: 15};
        
    // para enviar algo, usamos `emit`
    // que tiene un nombre de mensaje,
    // y un objeto
    socket.emit('respuesta', lista);
  });
});

// Creación del servidor en sí (por HTTP)
http.listen(port, () => {
  console.log('Servidor escuchando en el puerto', port);
});
