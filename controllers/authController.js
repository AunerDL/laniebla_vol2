const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

exports.registrar = async (req, res) => {
  const {
    nombre,
    apellidos,
    usuario,
    contraseña,
    correo,
    telefono,
    domicilio,
    familiar,
    preguntaSecreta,
    respuestaSecreta,
  } = req.body;

  console.log('[🟡 Body recibido]', req.body);

  // Validaciones básicas
  if (
    !usuario || !nombre || !apellidos || !contraseña ||
    !correo || !telefono || !domicilio || !familiar ||
    !preguntaSecreta || !respuestaSecreta
  ) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si ya existe usuario o correo
    const existeUsuario = await Usuario.findOne({ usuario });
    if (existeUsuario) {
      console.log('[🔴 Usuario existente]', usuario);
      return res.status(400).json({ mensaje: 'Usuario ya existe' });
    }

    const existeCorreo = await Usuario.findOne({ correo });
    if (existeCorreo) {
      console.log('[🔴 Correo existente]', correo);
      return res.status(400).json({ mensaje: 'Correo ya registrado' });
    }

    const nuevaPersona = new Usuario({
      guid: uuidv4(),
      nombre,
      apellidos,
      usuario,
      contraseña: await bcrypt.hash(contraseña, 10),
      correo,
      telefono,
      domicilio,
      familiar,
      preguntaSecreta,
      respuestaSecreta: await bcrypt.hash(respuestaSecreta, 10), // Hasheamos la respuesta secreta
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

// Obtener todos los usuarios (sin contraseñas ni respuestas secretas)
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-contraseña -respuestaSecreta');
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
};

// Obtener usuario por GUID (sin contraseña ni respuesta secreta)
exports.obtenerUsuarioPorGuid = async (req, res) => {
  try {
    const usuario = await Usuario.findOne({ guid: req.params.guid }, '-contraseña -respuestaSecreta');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar usuario', error });
  }
};

// Editar usuario por GUID
exports.editarUsuario = async (req, res) => {
  try {
    const datosActualizados = { ...req.body };

    // Si actualizan contraseña, hashearla
    if (datosActualizados.contraseña) {
      datosActualizados.contraseña = await bcrypt.hash(datosActualizados.contraseña, 10);
    }

    // Si actualizan respuesta secreta, hashearla también
    if (datosActualizados.respuestaSecreta) {
      datosActualizados.respuestaSecreta = await bcrypt.hash(datosActualizados.respuestaSecreta, 10);
    }

    const usuario = await Usuario.findOneAndUpdate(
      { guid: req.params.guid },
      datosActualizados,
      { new: true }
    ).select('-contraseña -respuestaSecreta'); // No devolver campos sensibles

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
// Obtener pregunta secreta por nombre de usuario
exports.obtenerPreguntaSecreta = async (req, res) => {
  const { usuario } = req.params;
  try {
    const user = await Usuario.findOne({ usuario });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Enviamos solo la pregunta secreta, nunca la respuesta
    res.status(200).json({ preguntaSecreta: user.preguntaSecreta });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
};

// Validar respuesta secreta y permitir cambio de contraseña
exports.recuperarConRespuestaSegura = async (req, res) => {
  const { usuario } = req.params;
  const { respuestaSecreta, nuevaContraseña } = req.body;

  if (!respuestaSecreta || !nuevaContraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  try {
    const user = await Usuario.findOne({ usuario });
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const respuestaCorrecta = await bcrypt.compare(respuestaSecreta, user.respuestaSecreta);
    if (!respuestaCorrecta) {
      return res.status(401).json({ mensaje: 'Respuesta secreta incorrecta' });
    }

    // Actualizamos la contraseña
    user.contraseña = await bcrypt.hash(nuevaContraseña, 10);
    await user.save();

    res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
};
 controller