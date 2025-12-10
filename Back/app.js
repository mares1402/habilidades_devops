const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Carga las variables de entorno desde .env

const express = require('express');
const app = express();
const conexion = require('./conexion');
const bcrypt = require('bcrypt');
const { registrarUsuario, verificarDuplicados, buscarUsuarioPorEmail } = require('./singup');

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
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden' });
    }

    // Verificar duplicados por email o teléfono
    verificarDuplicados(email, telefono, (err, duplicado) => {
        if (err) {
            console.error('Error detallado de BD:', err);
            return res.status(500).json({ success: false, message: 'Error al verificar duplicados' });
        }
        if (duplicado.email) return res.status(400).json({ success: false, message: 'Este correo ya está registrado' });
        if (duplicado.telefono) return res.status(400).json({ success: false, message: 'Este número de teléfono ya está registrado' });

        registrarUsuario({ name, apellido_paterno, apellido_materno, email, password, telefono }, (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ success: false, message: 'Error al registrar usuario' });
            }
            res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
        });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios' });
    }

    buscarUsuarioPorEmail(email, (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Error en el servidor' });
        if (!user) return res.status(400).json({ success: false, message: 'Usuario no encontrado' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ success: false, message: 'Error al verificar contraseña' });
            if (!isMatch) return res.status(400).json({ success: false, message: 'Contraseña incorrecta' });

            // Login exitoso: devolvemos datos del usuario (sin la contraseña)
            const { password, ...userData } = user;
            res.json({ success: true, user: userData });
        });
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});