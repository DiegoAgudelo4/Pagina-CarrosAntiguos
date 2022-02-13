var usuario = "";
let url = "http://localhost:3000";
let resultados = "";
let contenedor = document.querySelector("tbody");
let cabeceraTabla = document.querySelector("thead")

function enviarForm(direccion) {
  document.getElementById("input").value = usuario;
  console.log("lo que se va a enviar :" + document.getElementById("input").value)
  document
    .querySelector("form")
    .setAttribute("action", direccion);
  document.getElementById("formulario").submit();
}
window.onload = getCedulaURL();
function getCedulaURL() {
  usuario = new URLSearchParams(window.location.search).get('login');
  document.getElementById("idCedula").innerText = "ID: " + usuario;
}
let mostrar = (compra) => {
  //recibimos los datos
  if (compra.length > 0) {
    cabeceraTabla.innerHTML = `<tr class="text-center">
      <th>Referencia</th>
      <th>Fecha</th>
      <th>Valor</th>
      <th>cedula Cliente</th>
      <th>Placa Vehiculo</th>
      <th>Opcion</th>
    </tr>`
    compra.forEach((compra) => {
      //para cada documento, hacer esto || creamos la estructura de la fina con sus datos
      resultados += `<tr> 
                                <td>${compra.id_compra}</td>
                                <td>${compra.fec_comp}</td>
                                <td>${numeroConComas(compra.valor_comp)}</td>
                                <td>${compra.id_cliente}</td>
                                <td>${compra.id_placa}</td>
                                <td class="text-center"><a class="btnBorrar btn btn-danger">Borrar</a></td>
                           </tr>
                        `;
    });
    contenedor.innerHTML = resultados;
  } else {
    document.getElementById("non").innerHTML = "<h3 class='text-center'> No tienes registro de compras</h3>"
  }


};
//pone comas
function numeroConComas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function removerComas(x) {
  return x.replace(/,/g, "");
}

//Procedimiento Mostrar
fetch(url + "/compras/" + usuario) //siempre va hacer esto de primero
  .then((response) => response.json()) //recibimos un formato json
  .then((data) => mostrar(data)) //lo enviamos a  la funcion mostrar
  .catch((error) => console.log(error));

let on = (element, event, selector, handler) => {
  element.addEventListener(event, (e) => {
    if (e.target.closest(selector)) { //selecciona la fila que clickeamos
      handler(e);
    }
  });
};

//Procedimiento Borrar
on(document, "click", ".btnBorrar", (e) => {
  let fila = e.target.parentNode.parentNode; //extrae el numero de la fila clickeada
  let id_compra = fila.firstElementChild.innerHTML; //extrae el parametro por el cual vamos a borrar "id"
  alertify.confirm(
    "¿Seguro de eliminar este registro " + id_compra + "?", //pedimos confirmacion
    function () {
      console.log(url + "/compras/delete/" + id_compra);
      fetch(url + "/compras/delete/" + id_compra, {
        //ingresamos la direccion de la peticion
        method: "DELETE", //seleccionamos el metodo
      })
        location.reload();
    },
    function () {
      alertify.error("Cancel");
    }
  );
});

