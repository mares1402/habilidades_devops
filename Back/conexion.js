const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
let mysql = require('mysql2');

const connectionOptions = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
};

let conexion = mysql.createPool(connectionOptions);

conexion.getConnection((error, connection) => {
    if (error) {
        console.log('La base de datos se está iniciando. La conexión se establecerá automáticamente al recibir peticiones.');
    } else {
        console.log("Conexión exitosa");
        connection.release();
    }
});
module.exports = conexion;
// cerrar la conexión
// ctrl + c
// conexion.end();