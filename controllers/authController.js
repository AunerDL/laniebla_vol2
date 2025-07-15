const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.registrar = async (req, res) => {
  const { nombre, apellidos, usuario, contraseña, roles, preguntaSeguridad, respuestaSeguridad } = req.body;

  console.log('[🟡 Body recibido]', req.body);

  // Validaciones básicas
  if (!usuario || !nombre || !apellidos || !contraseña || !roles) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    const existente = await Usuario.findOne({ usuario });
    if (existente) {
      console.log('[🔴 Usuario existente]', usuario);
      return res.status(400).json({ mensaje: 'Usuario ya existe' });
    }

    const nuevaPersona = new Usuario({
      guid: uuidv4(),
      nombre,
      apellidos,
      usuario,
      contraseña: await bcrypt.hash(contraseña, 10),
      roles,
    });

    const guardado = await nuevaPersona.save();
    console.log('[✅ Usuario guardado]', guardado);

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('[❌ Error en el servidor]', error);
    res.status(500).json({ mensaje: 'Error en el servidor', error });
  }
};


exports.login = async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const usuarioEncontrado = await Usuario.findOne({ usuario });
    if (!usuarioEncontrado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const coincide = await bcrypt.compare(contraseña, usuarioEncontrado.contraseña);
    if (!coincide) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    res.status(200).json({ mensaje: 'Login exitoso', guid: usuarioEncontrado.guid });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
};

// Obtener todos los usuarios (sin contraseñas ni respuestas)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-contraseña -respuestaSeguridad');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

// Obtener usuario por GUID
exports.obtenerUsuarioPorGuid = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ guid: req.params.guid }, '-contraseña -respuestaSeguridad');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar usuario', error });
  }
};

// Editar usuario por GUID
exports.editarUsuario = async (req, res) => {
  try {
    const datosActualizados = req.body;
    if (datosActualizados.contraseña) {
      const bcrypt = require('bcryptjs');
      datosActualizados.contraseña = await bcrypt.hash(datosActualizados.contraseña, 10);
    }
   

    const usuario = await Usuario.findOneAndUpdate(
      { guid: req.params.guid },
      datosActualizados,
      { new: true }
    );
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: 'Usuario actualizado', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error });
  }
};

// Eliminar usuario por GUID
exports.eliminarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findOneAndDelete({ guid: req.params.guid });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error });
  }
};

