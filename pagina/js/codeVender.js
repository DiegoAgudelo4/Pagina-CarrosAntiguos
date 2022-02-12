//Definición de variables
let url = "http://localhost:3000";
let contenedor = document.querySelector("tbody");
let resultados = "";

function enviarForm(direccion) { //envía la cedula de la persona que está iniciada
  document.getElementById("input").value = usuario;
  console.log("lo que se va a enviar :" + document.getElementById("input").value)
  document
    .querySelector("form")
    .setAttribute("action", direccion);
  document.getElementById("formulario").submit();
}

var modalCarros = new bootstrap.Modal(document.getElementById("modalCarros"));
var formCarros = document.querySelector("form");
var id_placa = document.getElementById("ID_PLACA");
var marca = document.getElementById("MARCA");
var modelo = document.getElementById("MODELO");
var color = document.getElementById("COLOR");
var valor = document.getElementById("VALOR");
var opcion = "";
var usuario = "";

//funcion para mostrar los resultados
let mostrar = (carros) => {
  //recibimos los datos
  carros.forEach((carros) => {
    //para cada documento, hacer esto || creamos la estructura de la fina con sus datos
    resultados += `<tr> 
                            <td>${carros.id_placa}</td>
                            <td>${carros.marca}</td>
                            <td>${carros.modelo}</td>
                            <td>${carros.color}</td>
                            <td>${numeroConComas(carros.valor)}</td>
                            <td class="text-center"><a class="btnEditar btn btn-primary">Editar</a><a class="btnBorrar btn btn-danger">Borrar</a></td>
                       </tr>
                    `;
  });
  contenedor.innerHTML = resultados;
};
//pone comas
function numeroConComas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function removerComas(x) {
  return x.replace(/,/g, "");
}
btnCrearCarro.addEventListener("click", () => {
  id_placa.value = "";
  marca.value = "";
  modelo.value = "";
  color.value = "";
  valor.value = "";
  quitarReadOnly("ID_PLACA");
  modalCarros.show();
  opcion = "crear";
});


//Procedimiento Mostrar
fetch(url + "/carros/venta") //siempre va hacer esto de primero
  .then((response) => response.json()) //recibimos un formato json
  .then((data) => mostrar(data)) //lo enviamos a  la funcion mostrar
  .catch((error) => console.log(error));

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
  let id_placa = fila.firstElementChild.innerHTML; //extrae el parametro por el cual vamos a borrar "id"
  alertify.confirm(
    "¿Seguro de eliminar el carro con placa " + id_placa + "?", //pedimos confirmacion
    function () {
      console.log(url + "/carros/delete/" + id_placa);
      fetch(url + "/carros/delete/" + id_placa, {
        //ingresamos la direccion de la peticion
        method: "DELETE", //seleccionamos el metodo
      })
        .then((response) => response.json())
        .then(() => location.reload()); //recargamos la pagina
      alertify.confirm("Borrado correctamente");
    },
    function () {
      alertify.error("Cancel");
    }
  );
});

//Procedimiento: Sube los datos al formulario para editar

on(document, "click", ".btnEditar", (e) => {
  let fila = e.target.parentNode.parentNode; //extrae el numero de la fila clickeada
  id_placa.value = fila.children[0].innerHTML; //extrae los datos de cada una de las celdas
  marca.value = fila.children[1].innerHTML;
  modelo.value = fila.children[2].innerHTML;
  color.value = fila.children[3].innerHTML;
  valor.value = parseInt(removerComas(fila.children[4].innerHTML));
  ponerReadOnly("ID_PLACA"); //cambia el input a solo lectura
  opcion = "editar"; //confirmamos que es para editar
  modalCarros.show();
});
function ponerReadOnly(id) {
  // Ponemos el atributo de solo lectura
  $("#" + id).attr("readonly", "readonly");
  // Ponemos una clase para cambiar el color del texto y mostrar que
  // esta deshabilitado
  $("#" + id).addClass("readOnly");
}
function quitarReadOnly(id) {
  // Eliminamos el atributo de solo lectura
  $("#" + id).removeAttr("readonly");
  // Eliminamos la clase que hace que cambie el color
  $("#" + id).removeClass("readOnly");
}


function validarRegistro() {
  console.log("validando " + id_placa.value)
  if (!id_placa.value.match(/[a-zA-Z]{3}[0-9]{3}$/)) {
    alertify.error("Llene correctamente el campo placa");
    return;
  }
  if (!marca.value.match(/[a-zA-Z\s]{3,30}$/)) {
    alertify.error("Llene correctamente el campo Marca");
    return;
  }
  if (!modelo.value.match(/[a-zA-Z0-9\s]{3,30}$/)) {
    alertify.error("Llene correctamente el campo Modelo");
    return;
  }
  if (color.value === "") {
    alertify.error("Llene correctamente el campo Color");
    return;
  }
  if (!valor.value.match(/^[0-9]+$/)) {
    alertify.error("Llene correctamente el campo Valor");
    return;
  }
  console.log("entró a validar en el Registro")
  console.log("validado placa " + id_placa.value + " marca " + marca.value + " Modelo " + modelo.value + " color " + color.value + " valor " + valor.value);
  fetch(url + "/carros/venta") //siempre va hacer esto de primero
    .then((response) => response.json()) //recibimos un formato json
    .then((data) => mostrarC(data))
    .catch((error) => console.log("error en fetch: " + error));
}
let mostrarC = (carros) => {
  var existe = false;
  console.log("verificando placa '" + id_placa.value + "'");
  carros.forEach((carros) => {
    console.log(
      "placa: " + carros.id_placa + "    placa a validar: " + id_placa.value
    );
    if (id_placa.value == carros.id_placa) {
      alertify.error("El carro ya existe en el sistema")
      existe = true;
      return;
    }
  });
  if (!existe) {
    guardarCarroNuevo();
  }
};

function guardarCarroNuevo() {
  console.log("Guardando " + id_placa.value + " marca " + marca.value + " Modelo " + modelo.value + " color " + color.value + " valor " + valor.value);
  fetch(url + "/carros/crear", { //ingresamos la direccion de la peticion
    method: "POST", //elegimos el metodo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ //enviamos un body tipo json con los datos que queremos crear
      id_placa: id_placa.value,
      marca: marca.value,
      modelo: modelo.value,
      color: color.value,
      valor: parseInt(valor.value),
    })
  }).catch((error) => console.log(error));
  alertify.confirm("Completado", "Carro publicado correctamente", function () {
    modalCarros.hide();
    location.reload();
  }, function () {
    modalCarros.hide();
    location.reload();
  });

}

//Procedimiento para Crear y Editar
function show() {
  console.log("submit sucessful");
  if (opcion == "crear") {
    console.log("opcion Crear")
    validarRegistro();
    return;
  }
  if (opcion == "editar") {
    //si no es crear, es editar, pero por si las moscas confirmamos
    console.log("OPCION EDITAR");
    console.log("id entrante a editar: " + id_placa);
    fetch(url + "/carros/update/" + id_placa.value, {
      //ingresamos la direccion de la peticion
      method: "PUT", //elegimos el metodo
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        //enviamos un body tipo json con los datos que queremos editar
        id_placa: id_placa.value,
        marca: marca.value,
        modelo: modelo.value,
        color: color.value,
        valor: parseInt(valor.value),
      }),
    })
      .then((response) => response.json())
      .then(() => finalizarUpdate());
  }
}
function finalizarUpdate() {
  modalCarros.hide();
  location.reload();
}
//fin tabla carros************************************************************************************************************

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
window.onload = getCedulaURL();
function getCedulaURL() {
  usuario = new URLSearchParams(window.location.search).get('login');
  document.getElementById("idCedula").innerText = "ID: " + usuario;
}