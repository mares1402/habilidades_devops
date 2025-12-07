require('dotenv').config(); // Carga las variables de entorno desde .env

const express = require('express');
const path = require('path');
const app = express();
const conexion = require('./Back/conexion');
const { registrarUsuario, verificarDuplicados } = require('./Back/singup');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/Font'));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});