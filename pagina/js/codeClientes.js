//Definición de variables
let url = "http://localhost:3000";
let contenedor = document.querySelector("tbody");
let resultados = "";
var usuario = "";

window.onload = getCedulaURL();
function getCedulaURL() {
  usuario = new URLSearchParams(window.location.search).get('login');
  document.getElementById("idCedula").innerText = "ID: " + usuario;
}

function enviarForm(direccion) {
  document.getElementById("input").value = usuario;
  console.log("lo que se va a enviar :" + document.getElementById("input").value)
  document
    .querySelector("form")
    .setAttribute("action", direccion);
  document.getElementById("formulario").submit();
}


let modalClientes = new bootstrap.Modal(
  document.getElementById("modalClientes")
);
let FormClientes = document.querySelector("form");
let Cedula = document.getElementById("Cedula");
let Nombre = document.getElementById("Nombre");
let Apellido = document.getElementById("Apellido");
let Direccion = document.getElementById("Direccion");
let Telefono = document.getElementById("Telefono");
var opcion = "";

//funcion para mostrar los resultados


let mostrar = (clientes) => {
  //recibimos los datos
  var validado =false;
  clientes.forEach((clientes)=>{
    if(clientes.id_cliente == usuario){
      validado =true;
    }
  })
  if (validado) {
    clientes.forEach((clientes) => {
      //para cada documento, hacer esto || creamos la estructura de la fina con sus datos


      resultados += `<tr> 
      <td>${clientes.id_cliente}</td>
      <td>${clientes.nombre_comp}</td>
      <td>${clientes.apellido_com}</td>
      <td>${clientes.direccion}</td>
      <td>${clientes.telefono}</td>
      <td class='text-center'><a class='btnEditar btn btn-primary'>Editar</a><a class='btnBorrar btn btn-danger'>Borrar</a></td>
 </tr>
`;
      contenedor.innerHTML = resultados;
    })}
    else {
      alert("tu usuario ha sido borrado, por favor, inicia de nuevo");
      window.location.href = "login.html"
    }

};
window.onload = cargarClientes();
function cargarClientes() {
  fetch(url + "/clientes") //siempre va hacer esto de primero
    .then((response) => response.json()) //recibimos un formato json
    .then((data) => mostrar(data)) //lo enviamos a  la funcion mostrar
    .catch((error) => console.log("error en fetch" + error));
}
//Procedimiento Mostrar


let on = (element, event, selector, handler) => {
  element.addEventListener(event, (e) => {
    if (e.target.closest(selector)) {
      handler(e);
    }
  });
};

//Procedimiento Borrar
on(document, "click", ".btnBorrar", (e) => {
  let fila = e.target.parentNode.parentNode; //extrae el numero de la fila clickeada
  let Cedula = fila.firstElementChild.innerHTML; //extrae el parametro por el cual vamos a borrar 'id'
  alertify.confirm(
    "¿Seguro de eliminar cliente con cedula: " + Cedula + "?", //pedimos confirmacion
    function () {
      console.log(url + "/clientes/delete/" + Cedula);
      fetch(url + "/cliente/delete/" + Cedula, {
        //ingresamos la direccion de la peticion
        method: "DELETE", //seleccionamos el metodo
      })
        .then((response) => response.json());
      alert("Borrado correctamente");
        location.reload();
    },
    function () {
      alertify.error("Cancel");
    }
  );
});

//Procedimiento: Sube los datos al formulario para editar

on(document, "click", ".btnEditar", (e) => {
  let fila = e.target.parentNode.parentNode; //extrae el numero de la fila clickeada
  Cedula.value = fila.children[0].innerHTML; //extrae los datos de cada una de las celdas
  Nombre.value = fila.children[1].innerHTML;
  Apellido.value = fila.children[2].innerHTML;
  Direccion.value = fila.children[3].innerHTML;
  Telefono.value = fila.children[4].innerHTML;
  ponerReadOnly("id_cliente"); //cambia el input a solo lectura
  console.log("evento listener crear completado");
  opcion = "editar"; //confirmamos que es para editar
  modalClientes.show();
});
function ponerReadOnly(id) {
  // Ponemos el atributo de solo lectura
  $("#" + id).attr("readonly", "readonly");
  // Ponemos una clase para cambiar el Direccion del texto y mostrar que
  // esta deshabilitado
  $("#" + id).addClass("readOnly");
}
function quitarReadOnly(id) {
  // Eliminamos el atributo de solo lectura
  $("#" + id).removeAttr("readonly");
  // Eliminamos la clase que hace que cambie el Direccion
  $("#" + id).removeClass("readOnly");
}


//fin tabla clientes************************************************************************************************************

//*****************************************************************************************************************************
//Ordenar tablas
$("th").click(function () {
  var table = $(this).parents("table").eq(0);
  var rows = table
    .find("tr:gt(0)")
    .toArray()
    .sort(comparer($(this).index()));
  this.asc = !this.asc;
  if (!this.asc) {
    rows = rows.reverse();
  }
  for (var i = 0; i < rows.length; i++) {
    table.append(rows[i]);
  }
  setIcon($(this), this.asc);
});

function comparer(index) {
  return function (a, b) {
    var valA = getCellValue(a, index),
      valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB)
      ? valA - valB
      : valA.localeCompare(valB);
  };
}

function getCellValue(row, index) {
  return $(row).children("td").eq(index).html();
}

function setIcon(element, asc) {
  $("th").each(function (index) {
    $(this).removeClass("sorting");
    $(this).removeClass("asc");
    $(this).removeClass("desc");
  });
  element.addClass("sorting");
  if (asc) element.addClass("asc");
  else element.addClass("desc");
}
//fin ordenar tablas
