const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/registro', authCtrl.registrar);
router.post('/login', authCtrl.login);
router.get('/usuarios', authCtrl.obtenerUsuarios); // Listar todos
router.get('/usuarios/:guid', authCtrl.obtenerUsuarioPorGuid); // Buscar por GUID
router.put('/usuarios/:guid', authCtrl.editarUsuario); // Editar por GUID
router.delete('/usuarios/:guid', authCtrl.eliminarUsuario); // Eliminar por GUID

// Obtener pregunta secreta por usuario
router.get('/usuarios/:usuario/pregunta', authCtrl.obtenerPreguntaSecreta);

// Validar respuesta secreta y permitir cambio de contraseña
router.post('/usuarios/:usuario/recuperar', authCtrl.recuperarConRespuestaSegura);

module.exports = router;