const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Carga las variables de entorno desde .env

const express = require('express');
const app = express();
const conexion = require('./conexion');
const { registrarUsuario, verificarDuplicados } = require('./singup');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar CORS para permitir peticiones desde el Front
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.post('/signup', (req, res) => {
    const { name, apellido_paterno, apellido_materno, email, password, confirm_password, telefono } = req.body;

    // Validar que todos los campos estén presentes
    if (!name || !apellido_paterno || !apellido_materno || !email || !password || !confirm_password || !telefono) {
        return res.status(400).send('Todos los campos son obligatorios');
    }

    if (password !== confirm_password) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    // Verificar duplicados por email o teléfono
    verificarDuplicados(email, telefono, (err, duplicado) => {
        if (err) return res.status(500).send('Error al verificar duplicados');
        if (duplicado.email) return res.status(400).send('Este correo ya está registrado');
        if (duplicado.telefono) return res.status(400).send('Este número de teléfono ya está registrado');

        registrarUsuario({ name, apellido_paterno, apellido_materno, email, password, telefono }, (err, result) => {
            if (err) return res.status(500).send('Error al registrar usuario');
            res.send('Usuario registrado exitosamente');
        });
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});