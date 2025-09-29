const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "formulario_db",
  port: process.env.DB_PORT || 3306
};

const pool = mysql.createPool(dbConfig);

// Crear tabla si no existe
const createTable = async () => {
  try {
    const connection = await pool.getConnection();
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dni VARCHAR(20) UNIQUE NOT NULL,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        fecha_nacimiento DATE NOT NULL,
        genero ENUM("masculino", "femenino", "otro") NOT NULL,
        ciudad VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await connection.execute(createTableQuery);
    console.log("Tabla usuarios verificada/creada correctamente");
    connection.release();
  } catch (error) {
    console.error("Error creando tabla:", error);
  }
};

createTable();

module.exports = pool;
