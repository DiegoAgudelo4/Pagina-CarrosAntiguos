const { Pool } = require("pg"); // Controlador de postgres
var MongoClient = require("mongodb").MongoClient; // Controlador de mongo

//credenciales de la base de datos postgresql
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "CarrosAntiguos",
  user: "postgres",
  password: "ijueputa",
});
const urlMongo = "mongodb://localhost:27017/"; //direccion por defecto de mongo

const getCarros = async (req, res, next) => {
  let response = await pool.query("SELECT * from CARRO"); //hace la consulta en postgres
  console.log("**getCarrosPostgres**\n Consulta exitosa");
  res.json(response.rows); //responde con un json (postgres)
  next();
  //mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor
      .collection("CARROS")
      .find()
      .forEach((value) => {
        //busca en la coleccion elegida por los parametros que quiero
        console.log(value); //muestra los resultados en la consola (mongo)
      });
  });
  console.log("**getCarrosMongo**\n Consulta finalizada correctamente");
}

//tabla de carros
const getCarrosQuitandoCompra = async (req, res, next) => {
  try {
    //postgres
    let usuario = req.params.id_cliente;
    let response = await pool.query("SELECT ca.ID_PLACA, ca.MARCA, ca.MODELO, ca.COLOR, ca.VALOR from carro ca except select ca.ID_PLACA, ca.MARCA, ca.MODELO, ca.COLOR, ca.VALOR from carro ca inner join compra co on ca.id_placa = co.id_placa"); //hace la consulta en postgres
    console.log("**getCarrosPostgres**\n Consulta exitosa");
    res.json(response.rows); //responde con un json (postgres)
    next();
    //mongo
    MongoClient.connect(urlMongo, function (err, client) {
      //se conecta a mongo
      var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
      cursor
        .collection("CARROS")
        .find({ comprado: true })
        .forEach((value) => {
          //busca en la coleccion elegida por los parametros que quiero
          console.log(value); //muestra los resultados en la consola (mongo)
        });
    });
    console.log("**getCarrosMongo**\n Consulta finalizada correctamente");
  } catch (error) {
    console.log(error, "  **Error en getCarros**");
  }
};
//obtener los eventos relacionados con la placa de un carro
const getEventoByPlaca = async (req, res) => {
  console.log("***EventoByplaca****\n placa: " + req.params.placa); //obtenemos la placa que nos pasan por parametro http
  const response = await pool.query(
    "SELECT * FROM evento WHERE id_placa = $1", //hacemos la respectiva consulta
    [req.params.placa]
  );
  res.json(response.rows);
};
//Agregar un nuevo registro a la tabla carro
const createCarro = async (req, res) => {
  const { id_placa, marca, modelo, color, valor } = req.body; //obtenemos los datos que recibe el api en json
  const response = await pool.query(
    //hacemos la insercion
    "INSERT INTO CARRO(ID_PLACA, MARCA, MODELO, COLOR, VALOR) VALUES ($1, $2, $3, $4, $5)",
    [id_placa, marca, modelo, color, valor]
  );
  res.json({
    //esto es una respuesta en json, no es necesario si hay estructura html
    message: "Carro Agregado Satisfactoriamente",
    body: {
      user: { id_placa, marca, modelo, color, valor },
    },
  });
  console.log(
    "***Postgres***\n Datos creados correctamente: " +
    id_placa +
    ", " +
    marca +
    ", " +
    modelo +
    ", " +
    color +
    ", " +
    valor
  ); //fin posgres
  //inicio mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("CARROS").insertOne({
      //inserta los datos a la colleccion elegida
      id_placa: id_placa,
      marca: marca,
      modelo: modelo,
      color: color,
      valor: valor,
      comprado: false
    });
  });
  console.log("**mongo**\n Datos creados correctamente");
};
//proceso de actualizar un carro  de la base de datos
const updateCarro = async (req, res) => {
  const id_placa = req.params.placa; //obtenemos la placa que nos pasan por parametro http tambien se puede por req.body
  const { marca, modelo, color, valor } = req.body; //obtenemos los datps que queremos actualizar
  //postgres
  const response = await pool.query(
    "UPDATE carro SET marca = $2, modelo = $3, color=$4, valor=$5 WHERE id_placa = $1", //hacemos la respectiva consulta
    [id_placa, marca, modelo, color, valor]
  );
  console.log(
    "***update**** placa " +
    id_placa +
    " Actualizada correctamente con los siguientes datos: " +
    marca +
    ", " +
    modelo +
    ", " +
    color +
    ", " +
    valor
  );
  res.json("User Updated Successfully");
  //mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("CARROS").updateOne(
      {
        //parametro para actualizar *consulta
        id_placa: id_placa, //es como el where de postgres
      },
      {
        //datos a actualizar
        $set: {
          marca: marca,
          modelo: modelo,
          color: color,
          valor: valor,
        },
      }
    );
  });
};
//Proceso de  borrar un carro de la base de datos
const deleteCarro = async (req, res) => {
  //postgres
  const id_placa = req.params.placa; //obtenemos la placa que nos pasan por parametro http
  console.log("***Delete Carro*** Placa: " + req.params.placa);
  await pool.query("DELETE FROM evento where id_placa = $1", [id_placa]); //para evitar  violaciones a la clave foranea borramos primero de eventos
  await pool.query("DELETE FROM carro where id_placa = $1", [id_placa]); //realizamos la respectiva consulta
  res.json(`Carro ${id_placa} deleted Successfully`);
  res.json(undefined);
  //mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("EVENTOS").deleteOne({ id_placa: id_placa }); //borramos el registro de la tabla evento para tener consistencia con la depostgres
    cursor.collection("CARROS").deleteOne({ id_placa: id_placa }); //borramos el registro
  });
};

//fin dablas Carros************************************************************************************************************
//tablas de cliente
const getClientes = async (req, res, next) => {
  try {
    //postgres
    let response = await pool.query("SELECT * FROM CLIENTE"); //hace la consulta en postgres

    res.json(response.rows); //responde con un json (postgres)
    console.log("**getCarrosPostgres**\n Consulta exitosa ");
    next();
    //mongo
    MongoClient.connect(urlMongo, function (err, client) {
      //se conecta a mongo
      var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
      cursor
        .collection("CLIENTES")
        .find()
        .forEach((value) => {
          //busca en la coleccion elegida por los parametros que quiero
          console.log(value); //muestra los resultados en la consola (mongo)
        });
    });
    console.log("**getCarrosMongo**\n Consulta finalizada correctamente");
  } catch (error) {
    console.log(error, "  **Error en getCarros**");
  }
};

const createCliente = async (req, res) => {
  const { id_cliente, Nombre_comp, Apellido_com, Direccion, Telefono } =
    req.body; //obtenemos los datos que recibe el api en json
  const response = await pool.query(
    //hacemos la insercion
    "INSERT INTO CLIENTE(ID_CLIENTE, NOMBRE_COMP, APELLIDO_COM, DIRECCION, TELEFONO) VALUES ($1, $2, $3, $4, $5)",
    [id_cliente, Nombre_comp, Apellido_com, Direccion, Telefono]
  );
  res.json({
    //esto es una respuesta en json, no es necesario si hay estructura html
    message: "Carro Agregado Satisfactoriamente",
    body: {
      user: { id_cliente, Nombre_comp, Apellido_com, Direccion, Telefono },
    },
  });
  console.log(
    "***Postgres***\n Datos creados correctamente: " +
    id_cliente +
    ", " +
    Nombre_comp +
    ", " +
    Apellido_com +
    ", " +
    Direccion +
    ", " +
    Telefono
  ); //fin posgres
  //inicio mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("CLIENTES").insertOne({
      //inserta los datos a la colleccion elegida
      ID_Cedula: id_cliente,
      Nombre_comp: Nombre_comp,
      Apellido_com: Apellido_com,
      Direccion: Direccion,
      Telefono: Telefono,
    });
  });
  console.log("**mongo**\n Datos creados correctamente");
};

const updateCliente = async (req, res) => {
  const id_cliente = req.params.cedula; //obtenemos la placa que nos pasan por parametro http tambien se puede por req.body
  const { Nombre_comp, Apellido_com, Direccion, Telefono } = req.body; //obtenemos los datps que queremos actualizar
  //postgres
  const response = await pool.query(
    "UPDATE cliente SET nombre_comp = $2, apellido_com = $3, direccion=$4, telefono=$5 WHERE id_cliente = $1", //hacemos la respectiva consulta
    [id_cliente, Nombre_comp, Apellido_com, Direccion, Telefono]
  );
  console.log(
    "***update**** placa " +
    id_cliente +
    " Actualizada correctamente con los siguientes datos: " +
    Nombre_comp +
    ", " +
    Apellido_com +
    ", " +
    Direccion +
    ", " +
    Telefono
  );
  res.json("User Updated Successfully");
  //mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("CLIENTES").updateOne(
      {
        //parametro para actualizar *consulta
        ID_Cedula: id_cliente, //es como el where de postgres
      },
      {
        //datos a actualizar
        $set: {
          Nombre_comp: Nombre_comp,
          Apellido_com: Apellido_com,
          Direccion: Direccion,
          Telefono: Telefono,
        },
      }
    );
  });
};
const deleteCliente = async (req, res) => {
  //postgres
  const id_cliente = req.params.cedula; //obtenemos la placa que nos pasan por parametro http
  console.log("***Delete Carro***\n Placa: " + req.params.cedula);
  await pool.query("DELETE FROM cliente where id_cliente = $1", [id_cliente]); //realizamos la respectiva consulta
  //res.json(`Carro ${id_cliente} deleted Successfully`);
  //res.json(undefined);
  //mongo
  MongoClient.connect(urlMongo, function (err, client) {
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("CLIENTES").deleteOne({ ID_Cedula: id_cliente }); //borramos el registro
  });
};
//fin tablas de Clientes*********************************************************************************************************
//tablas de eventos

//fin tablas de eventos**********************************************************************************************************

//tabla compras 

const getCompras = async (req, res, next) => {
  try {
    //postgres
    const id_cliente = req.params.id_cliente;
    let response = await pool.query("SELECT * FROM COMPRA where id_cliente=$1", [id_cliente]); //hace la consulta en postgres

    res.json(response.rows); //responde con un json (postgres)
    console.log("**getComprasPostgres**\n Consulta exitosa ");
    next();
    //mongo
    MongoClient.connect(urlMongo, function (err, client) {
      //se conecta a mongo
      var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
      cursor
        .collection("COMPRAS")
        .find({ ID_Cedula: id_cliente, comprado: false })
        .forEach((value) => {
          //busca en la coleccion elegida por los parametros que quiero
          console.log(value); //muestra los resultados en la consola (mongo)
        });
    });
    console.log("**getComprasMongo**\n Consulta finalizada correctamente");
  } catch (error) {
    console.log(error, "  **Error en getCOMPRAS**");
  }
};

const createCompra = async (req, res) => {
  const { ID_COMPRA, FEC_COMP, VALOR_COMP, ID_CLIENTE, ID_PLACA } =
    req.body; //obtenemos los datos que recibe el api en json
  const response = await pool.query(
    //hacemos la insercion
    "INSERT INTO COMPRA(ID_COMPRA, FEC_COMP, VALOR_COMP, ID_CLIENTE, ID_PLACA) VALUES ($1, $2, $3, $4, $5)",
    [ID_COMPRA, FEC_COMP, VALOR_COMP, ID_CLIENTE, ID_PLACA]
  );
  res.json({
    //esto es una respuesta en json, no es necesario si hay estructura html
    message: "Carro Agregado Satisfactoriamente",
    body: {
      user: { ID_COMPRA, FEC_COMP, VALOR_COMP, ID_CLIENTE, ID_PLACA },
    },
  });
  console.log(
    "***Postgres***\n Datos creados correctamente: " +
    ID_COMPRA +
    ", " +
    FEC_COMP +
    ", " +
    VALOR_COMP +
    ", " +
    ID_CLIENTE +
    ", " +
    ID_PLACA
  ); //fin posgres
  //inicio mongo
  MongoClient.connect(urlMongo, function (err, client) { //crea la nueva compra
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("COMPRAS").insertOne({
      //inserta los datos a la colleccion elegida
      ID_COMPRA: ID_COMPRA,
      FEC_COMP: FEC_COMP,
      VALOR_COMP: VALOR_COMP,
      ID_CLIENTE: ID_CLIENTE,
      ID_PLACA: ID_PLACA,
    });
  });
  MongoClient.connect(urlMongo, function (err, client) { //cambia a estado true en comprado
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    console.log("ID PLACA en nueva compra: " + ID_PLACA)
    cursor.collection("CARROS").updateOne({ id_placa: ID_PLACA }, { $set: { comprado: true } });
  });
  console.log("**mongo**\n Datos creados correctamente");
};
const deleteCompra = async (req, res) => {
  console.log("***Delete Carro***\n ID: " + req.params.id_compra);
  //postgres
  const id_compra = req.params.id_compra; //obtenemos la placa que nos pasan por parametro http
  await pool.query("DELETE FROM COMPRA where ID_COMPRA = $1", [id_compra]); //realizamos la respectiva consulta
  //res.json(`Carro ${id_compra} deleted Successfully`);
  //res.json(undefined);
  //mongo
  var placa;
  MongoClient.connect(urlMongo, function (err, client) {//borra el registro en comprar
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("COMPRAS").find({ ID_COMPRA: parseInt(id_compra) }).forEach((value) => {
      //busca en la coleccion elegida por los parametros que quiero
      actualizarCompradoFalse(value.ID_PLACA, id_compra);
    });
  });
  
};
function actualizarCompradoFalse(placa, id_compra){
  MongoClient.connect(urlMongo, function (err, client) {//busca el documento a actualizar
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    console.log("placa a modificar en carros: "+ placa)
    cursor.collection("CARROS").updateOne({ id_placa: placa }, { $set: {comprado: false } });
  });
  MongoClient.connect(urlMongo, function (err, client) {//borra el registro en comprar
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("COMPRAS").deleteOne({ ID_COMPRA: parseInt(id_compra) }); //borramos el registro  
  });
}
//fin tabla compras
//tabla eventos
const getEventos = async (req, res) => {
   //obtenemos la placa que nos pasan por parametro http
  const response = await pool.query(
    "SELECT * FROM evento" //hacemos la respectiva consulta
  );
  res.json(response.rows);
  MongoClient.connect(urlMongo, function (err, client) {//borra el registro en comprar
    //se conecta a mongo
    console.log("***Eventos en mongo****\n")
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("EVENTOS").find().forEach((value) => {
      //busca en la coleccion elegida por los parametros que quiero
      console.log(value)
    }); //borramos el registro  
  });
};
//Fin tabla eventos********************************************************************

const crearEventos =async (req, res) => {
  const { id_evento, nombreEvento, id_placa } =req.body; //obtenemos los datos que recibe el api en json
    await pool.query(
      //hacemos la insercion
      "INSERT INTO EVENTO(ID_EVENTO, NOMBRE_EVENTO, ID_PLACA) VALUES ($1, $2, $3)",
      [id_evento, nombreEvento, id_placa]
    );
    console.log("***POSTGRES*** \n Evento creado correctamente")
    MongoClient.connect(urlMongo, function (err, client) { //crea la nueva compra
      //se conecta a mongo
      var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
      cursor.collection("EVENTOS").insertOne({
        //inserta los datos a la colleccion elegida
        ID_EVENTO: id_evento, 
        NOMBRE_EVENTO: nombreEvento,
        ID_PLACA: id_placa
      });
    });
    console.log("***MONGO*** \n Evento creado correctamente")
}
const deleteEvento=async (req, res) => {
  //postgres
  const id_evento = req.params.id_evento; //obtenemos la placa que nos pasan por parametro http
  await pool.query("DELETE FROM EVENTO where ID_EVENTO = $1", [id_evento]); //realizamos la respectiva consulta
  //res.json(`Carro ${id_compra} deleted Successfully`);
  //res.json(undefined);
  //mongo
  MongoClient.connect(urlMongo, function (err, client) {//borra el registro en comprar
    //se conecta a mongo
    var cursor = client.db("CarrosAntiguos"); //ingresa a la base de datos  que quiero
    cursor.collection("EVENTOS").deleteOne({ ID_EVENTO: parseInt(id_evento) }); //borramos el registro  
  });
}
const getEventosyDueño=async (req, res) => {
  console.log(req.params.id_placa);
  const id_placa = req.params.id_placa;
  var respuestaEvento=await pool.query("SELECT  nombre_evento, COALESCE(cli.nombre_comp, 'No tiene') as nombre_comp, coalesce(cli.apellido_com, 'No tiene') as apellido_com, e.id_placa FROM  evento e left join (cliente cli inner join compra co on cli.id_cliente=co.id_cliente ) on co.id_placa=e.id_placa where e.id_placa=$1", [id_placa]);
  res.json(respuestaEvento.rows);
}


module.exports = {
  getCarrosQuitandoCompra,
  getCarros,
  getEventoByPlaca,
  createCarro,
  updateCarro,
  deleteCarro,
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getCompras,
  createCompra,
  deleteCompra,
  getEventos,
  crearEventos,
  deleteEvento,
  getEventosyDueño
};
