//Definición de variables
const url = "http://localhost:3000";

var FormRegistro = document.querySelector("form");
var Cedula = document.getElementById("CedulaR");
var Nombre = document.getElementById("NombreR");
var Apellido = document.getElementById("ApellidoR");
var Direccion = document.getElementById("DireccionR");
var Telefono = document.getElementById("TelefonoR");

function guardarClienteNuevo(){
  fetch(url + "/cliente/crear", { //ingresamos la direccion de la peticion
    method: "POST", //elegimos el metodo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ //enviamos un body tipo json con los datos que queremos crear
      id_cliente: Cedula.value,
      Nombre_comp: Nombre.value,
      Apellido_com: Apellido.value,
      Direccion: Direccion.value,
      Telefono: Telefono.value, //necesario?
    })
  }).catch((error) => console.log(error));
  alert("Te has registrado satisfactoriamente");
  limpiarRegistro();
}

function validarRegistro(){
  console.log("validando"+Cedula.value)
  if(!Cedula.value.match(/^[0-9]{10}$/)){
    alertify.error("Llene correctamente el campo cedula");
    return;
  }
  if(!Nombre.value.match(/[a-zA-Z\s]{3,30}$/)){
    alertify.error("Llene correctamente el campo nombre");
    return;
  }
  if(!Apellido.value.match(/[a-zA-Z\s]{3,30}$/)){
    alertify.error("Llene correctamente el campo apellido");
    return;
  }
  if(Direccion.value ===""){
    alertify.error("Llene correctamente el campo direccion");
    return;
  }
  if(!Telefono.value.match(/^[0-9]{6}$/)){
    alertify.error("Llene correctamente el campo telefono");
    return;
  }
  encontraRepetida();
 
}
function limpiarRegistro(){
  Cedula.value ="";
  Nombre.value ="";
  Apellido.value="";
  Direccion.value= "";
  Telefono.value="";
}

let mostrarR = (clientes)=>{
  console.log("verificando");
  clientes.forEach((clientes) => {
    console.log(
      "Cedula: " + clientes.id_cliente + "    verificar: REgistro " + Cedula.value
    );
    if (Cedula.value == clientes.id_cliente) {
      alert("ya estás registrado")
      limpiarRegistro();
      return;
    }
  });
  guardarClienteNuevo();
};

function encontraRepetida() {
  console.log("entró a validar en el Registro")
  fetch("http://localhost:3000/clientes") //siempre va hacer esto de primero
    .then((response) => response.json()) //recibimos un formato json
    .then((data) => mostrarR(data))
    .catch((error) => console.log("error en fetch: " + error));

} //lo enviamos a  la funcion mostrar



