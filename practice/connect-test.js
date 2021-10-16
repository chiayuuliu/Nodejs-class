require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  })

  //是非同步的狀態,不會立刻結束, 要下exit
  connection.query(
    "SELECT * FROM address_book LIMIT 5",
    // process.exit(),
    (error,r)=>{
        console.log(r);
        process.exit();
    })