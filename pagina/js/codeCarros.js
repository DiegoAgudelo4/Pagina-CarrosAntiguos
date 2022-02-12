//Definición de variables
let url = "http://localhost:3000";
let contenedor = document.querySelector("tbody");
let resultados = "";



function enviarForm(direccion) {
  document.getElementById("input").value = usuario;
  console.log("lo que se va a enviar :" + document.getElementById("input").value)
  document
    .querySelector("form")
    .setAttribute("action", direccion);
  document.getElementById("formulario").submit();
}

let modalCarros = new bootstrap.Modal(document.getElementById("modalCarros"));
let formCarros = document.querySelector("form");
let id_placa = document.getElementById("ID_PLACA");
let marca = document.getElementById("MARCA");
let modelo = document.getElementById("MODELO");
let color = document.getElementById("COLOR");
let valor = document.getElementById("VALOR");
var opcion = "";
var usuario = "";

window.onload = getCedulaURL();
function getCedulaURL() {
  usuario = new URLSearchParams(window.location.search).get('login');
  document.getElementById("idCedula").innerText = "ID: " + usuario;
}
//funcion para mostrar los resultados
let mostrar = (carros) => {
  //recibimos los datos
  console.log("Carros: " + carros)
  carros.forEach((carros) => {
    //para cada documento, hacer esto || creamos la estructura de la fina con sus datos 
    resultados += `<tr> 
        <td>${carros.id_placa}</td>
        <td>${carros.marca}</td>
        <td>${carros.modelo}</td>
        <td>${carros.color}</td>
        <td>${numeroConComas(carros.valor)}</td>
        <td class="text-center"><a class="btnComprar btn btn-primary">Comprar</a></td>
   </tr>
`;
  })
  //lo enviamos a  la funcion mostrar
  contenedor.innerHTML = resultados;
};
//pone comas
function numeroConComas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function removerComas(x) {
  return x.replace(/,/g, "");
}

//Procedimiento Mostrar
fetch(url + "/carros") //siempre va hacer esto de primero
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
on(document, "click", ".btnEvento", (e) => {
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

on(document, "click", ".btnComprar", (e) => {
  let fila = e.target.parentNode.parentNode; //extrae el numero de la fila clickeada
  id_placa.value = fila.children[0].innerHTML; //extrae los datos de cada una de las celdas
  marca.value = fila.children[1].innerHTML;
  modelo.value = fila.children[2].innerHTML;
  color.value = fila.children[3].innerHTML;
  valor.value = parseInt(removerComas(fila.children[4].innerHTML));
  ponerReadOnly("ID_PLACA"); //cambia el input a solo lectura
  ponerReadOnly("MARCA");
  ponerReadOnly("MODELO");
  ponerReadOnly("COLOR");
  ponerReadOnly("VALOR");
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


function comprar() {
  var aleatorio = Math.floor(Math.random() * (900000 - 100) + 100)
  //verificamos que se seleccionó crear
  console.log("OPCION CREAR Carro" + valor.value);
  let date = new Date()
  console.log("fecha: " + date.toISOString())
  fetch(url + "/compras/crear", {
    //ingresamos la direccion de la peticion
    method: "POST", //elegimos el metodo
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      //enviamos un body tipo json con los datos que queremos crear
      ID_COMPRA: aleatorio,
      FEC_COMP: date.toISOString(),
      VALOR_COMP: valor.value,
      ID_CLIENTE: usuario,
      ID_PLACA: id_placa.value,
    }),
  })
    .then((res) => res.json())
    .then(() => confirmar()); //recargamos la pagina

}

function confirmar() {
  alertify.confirm("Correcto", "Compra exitosa", function () {
    modalCarros.hide();
    location.reload();
  }, function () {
    modalCarros.hide();
    location.reload();
  });

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
