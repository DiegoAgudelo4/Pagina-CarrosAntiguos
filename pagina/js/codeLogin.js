  function validarLogin() {
    console.log("entró a validar en el login")
    if (document.getElementById("CedulaLogin").value === "") {
      alertify.error("Rellene el campo cedula");
      return;
    }
    fetch("http://localhost:3000/clientes") //siempre va hacer esto de primero
      .then((response) => response.json()) //recibimos un formato json
      .then((data) => mostrar(data))
      .catch((error) => console.log("error en fetch: " + error));
  } //lo enviamos a  la funcion mostrar

  let mostrar = (clientes) => {
    var verificar = document.getElementById("CedulaLogin").value;
    console.log(clientes);
    console.log("verificando");
    clientes.forEach((clientes) => {
      console.log(
        "Cedula: " + clientes.id_cliente + "    verificar: " + verificar
      );
      if (verificar == clientes.id_cliente) {
        document
          .querySelector("form")
          .setAttribute("action", "Carros.html");
        document.getElementById("formulario").submit();
        return true;
      }
    });
    alertify.error(
      "La cedula ingresada no existe en la base de datos, por favor registrala."
    );
    console.log("no se encontró la cedula");

  };