const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  guid: { type: String, unique: true },
  usuario: { type: String, required: true, unique: true },
  nombre: String,
  apellidos: String,
  contraseña: String,
  roles: String,
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
