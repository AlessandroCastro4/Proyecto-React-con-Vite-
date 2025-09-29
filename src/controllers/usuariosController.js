const pool = require("../config/database");

// Validaciones
const validarUsuario = (usuario) => {
  const errors = [];
  
  if (!/^\d{8}$/.test(usuario.dni)) {
    errors.push("El DNI debe tener 8 dígitos");
  }
  
  if (!usuario.nombres || usuario.nombres.trim().length < 2) {
    errors.push("Los nombres son requeridos y deben tener al menos 2 caracteres");
  }
  
  if (!usuario.apellidos || usuario.apellidos.trim().length < 2) {
    errors.push("Los apellidos son requeridos y deben tener al menos 2 caracteres");
  }
  
  const fechaNac = new Date(usuario.fecha_nacimiento);
  const hoy = new Date();
  const edad = hoy.getFullYear() - fechaNac.getFullYear();
  
  if (isNaN(fechaNac.getTime())) {
    errors.push("Fecha de nacimiento inválida");
  } else if (edad < 18) {
    errors.push("Debe ser mayor de 18 años");
  }
  
  if (!["masculino", "femenino", "otro"].includes(usuario.genero)) {
    errors.push("Género inválido");
  }
  
  if (!usuario.ciudad || usuario.ciudad.trim().length < 2) {
    errors.push("La ciudad es requerida");
  }
  
  return errors;
};

// CRUD Operations
exports.obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM usuarios ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

exports.obtenerUsuario = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

exports.crearUsuario = async (req, res) => {
  try {
    const { dni, nombres, apellidos, fecha_nacimiento, genero, ciudad } = req.body;
    
    const errors = validarUsuario(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    const [result] = await pool.execute(
      "INSERT INTO usuarios (dni, nombres, apellidos, fecha_nacimiento, genero, ciudad) VALUES (?, ?, ?, ?, ?, ?)",
      [dni, nombres, apellidos, fecha_nacimiento, genero, ciudad]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      message: "Usuario creado exitosamente" 
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "El DNI ya existe" });
    } else {
      res.status(500).json({ error: "Error al crear usuario" });
    }
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const { nombres, apellidos, fecha_nacimiento, genero, ciudad } = req.body;
    
    const errors = validarUsuario({ ...req.body, dni: "12345678" });
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    const [result] = await pool.execute(
      "UPDATE usuarios SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, genero = ?, ciudad = ? WHERE id = ?",
      [nombres, apellidos, fecha_nacimiento, genero, ciudad, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json({ message: "Usuario actualizado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const [result] = await pool.execute("DELETE FROM usuarios WHERE id = ?", [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
