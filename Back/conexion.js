require('dotenv').config();
let mysql = require('mysql2');

const connectionOptions = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
};

let conexion = mysql.createConnection(connectionOptions);

conexion.connect(function(error){
    if(error){
        console.error('Error al conectar a la base de datos:', error);
        return;
    } else {
        console.log("Conexión exitosa");
    }       
});
module.exports = conexion;
// cerrar la conexión
// ctrl + c
// conexion.end();