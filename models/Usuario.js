const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  guid: { type: String, unique: true },
  usuario: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  contraseña: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  telefono: { type: String, required: true },
  domicilio: { type: String, required: true },
  familiar: { type: String, required: true },
  preguntaSecreta: { type: String, required: true },  // Nueva pregunta
  respuestaSecreta: { type: String, required: true }, // Nueva respuesta
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
