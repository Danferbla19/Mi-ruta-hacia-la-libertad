/* Mi ruta hacia la libertad - interfaz de la calculadora orientativa
   Conecta el formulario (#calc-form) con la lógica de js/calculo.js.
   Los casos de ejemplo son inventados y sirven para probar la herramienta. */

(function () {
  'use strict';

  var C = window.CalculoPena;
  var form = document.getElementById('calc-form');
  if (!C || !form) return;

  var cajaErrores = document.getElementById('calc-errores');
  var cajaResultado = document.getElementById('calc-resultado');

  var COLORES = { tercio: '#1F3A63', tres: '#8C6A2F', cuatro: '#7A1F2B' };
  var NOTAS = {
    tercio: 'Cumplir el tiempo no basta: el permiso exige además los demás requisitos del artículo 147.',
    tres: 'Cumplir el tiempo no basta: el juez de ejecución de penas valora conducta, arraigo y lo relativo a la víctima.',
    cuatro: 'Cumplir el tiempo no basta: cada beneficio tiene condiciones propias, como conducta certificada y no tener orden de captura.'
  };

  /* Casos de ejemplo (inventados). La fecha de corte es fija para que el resultado sea siempre el mismo. */
  var EJEMPLOS = {
    A: { penaAnios: 6, penaMeses: 0, penaDias: 0, fechaInicio: '2025-06-01', fechaCorte: '2026-10-26', redencionDias: 30, ritmoRedencion: 0 },
    B: { penaAnios: 10, penaMeses: 0, penaDias: 0, fechaInicio: '2022-03-10', fechaCorte: '2026-10-26', redencionDias: 300, ritmoRedencion: 0 },
    C: { penaAnios: 5, penaMeses: 0, penaDias: 0, fechaInicio: '2022-10-01', fechaCorte: '2026-10-26', redencionDias: 240, ritmoRedencion: 0 }
  };

  var CAMPOS = ['penaAnios', 'penaMeses', 'penaDias', 'fechaInicio', 'fechaCorte', 'redencionDias', 'ritmoRedencion'];

  function campo(nombre) {
    return form.elements[nombre];
  }

  function hoy() {
    var f = new Date();
    var m = f.getMonth() + 1;
    var d = f.getDate();
    return f.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function leer() {
    var datos = {};
    CAMPOS.forEach(function (n) { datos[n] = campo(n).value; });
    return datos;
  }

  function llenar(datos) {
    CAMPOS.forEach(function (n) {
      campo(n).value = datos[n] === undefined ? '' : datos[n];
    });
  }

  function el(tag, clase, texto) {
    var e = document.createElement(tag);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function dato(titulo, valor, detalle) {
    var caja = el('div', 'calc-stat');
    caja.appendChild(el('div', 'calc-stat-title', titulo));
    caja.appendChild(el('div', 'calc-stat-value', valor));
    if (detalle) caja.appendChild(el('div', 'calc-stat-detail', detalle));
    return caja;
  }

  function dias(n) {
    return n + (n === 1 ? ' día' : ' días');
  }

  function tarjetaFraccion(f, ritmo) {
    var tarjeta = el('article', 'calc-frac');
    tarjeta.style.setProperty('--frac', COLORES[f.id]);

    var cab = el('div', 'calc-frac-head');
    cab.appendChild(el('span', 'calc-frac-num', f.etiqueta));
    cab.appendChild(el('span', null, f.beneficio));
    tarjeta.appendChild(cab);

    var cuerpo = el('div', 'calc-frac-body');
    cuerpo.appendChild(el('p', 'calc-frac-state', f.alcanzada ? 'Tiempo alcanzado' : 'Faltan ' + C.textoDuracion(f.faltan)));

    var pista = el('div', 'calc-progress');
    pista.setAttribute('role', 'img');
    pista.setAttribute('aria-label', 'Avance hacia ' + f.etiqueta + ': ' + Math.floor(f.avance) + ' por ciento');
    var relleno = el('div', 'calc-progress-fill');
    relleno.style.width = f.avance + '%';
    pista.appendChild(relleno);
    cuerpo.appendChild(pista);

    cuerpo.appendChild(el('p', 'calc-frac-line', 'Tiempo exigido: ' + C.textoDuracion(f.umbral) + ' (' + dias(f.umbral) + ')'));
    if (!f.alcanzada) {
      var texto = 'Fecha estimada: ' + f.fechaEstimadaTexto;
      texto += ritmo > 0 ? ' (con redención de ' + ritmo + ' días por mes)' : ' (sin sumar más redención)';
      cuerpo.appendChild(el('p', 'calc-frac-line', texto));
    }
    cuerpo.appendChild(el('p', 'calc-frac-note', NOTAS[f.id]));
    tarjeta.appendChild(cuerpo);
    return tarjeta;
  }

  function pintar(r) {
    cajaResultado.textContent = '';

    var resumen = el('div', 'calc-summary');
    resumen.appendChild(dato('Pena impuesta', C.textoDuracion(r.penaDias), dias(r.penaDias)));
    resumen.appendChild(dato('Tiempo físico', C.textoDuracion(r.tiempoFisico), dias(r.tiempoFisico) + ' hasta el ' + r.fechaCorteTexto));
    resumen.appendChild(dato('Redención reconocida', C.textoDuracion(r.redencion), dias(r.redencion)));
    resumen.appendChild(dato('Tiempo cumplido', C.textoDuracion(r.cumplido), r.porcentaje.toFixed(1).replace('.', ',') + ' % de la pena'));
    cajaResultado.appendChild(resumen);

    var rejilla = el('div', 'calc-fracs');
    r.fracciones.forEach(function (f) { rejilla.appendChild(tarjetaFraccion(f, r.ritmoRedencion)); });
    cajaResultado.appendChild(rejilla);

    var total;
    if (r.faltaPena === 0) {
      total = r.excedePena
        ? 'Por este cómputo, el tiempo cumplido iguala o supera la pena impuesta. Verifique los datos: la pena total se confirma con la autoridad competente.'
        : 'Por este cómputo, el tiempo cumplido iguala la pena impuesta.';
    } else {
      total = 'Para cumplir la pena completa faltan ' + C.textoDuracion(r.faltaPena) + ' (fecha estimada: ' + r.fechaPenaTexto + ').';
    }
    cajaResultado.appendChild(el('p', 'calc-total', total));

    cajaResultado.appendChild(el('p', 'calc-disclaimer',
      'Resultado orientativo. Solo mide el requisito de tiempo con una convención sencilla (mes de 30 días, año de 360). No evalúa delitos excluidos ni los demás requisitos, y no reemplaza el cómputo oficial del juez ni la asesoría jurídica.'));

    cajaResultado.hidden = false;
  }

  function mostrarErrores(lista) {
    cajaErrores.textContent = '';
    if (lista.length) {
      var ul = el('ul');
      lista.forEach(function (m) { ul.appendChild(el('li', null, m)); });
      cajaErrores.appendChild(ul);
      cajaErrores.hidden = false;
    } else {
      cajaErrores.hidden = true;
    }
  }

  function calcular() {
    var r = C.calcular(leer());
    if (!r.ok) {
      mostrarErrores(r.errores);
      cajaResultado.hidden = true;
      return;
    }
    mostrarErrores([]);
    pintar(r);
  }

  function limpiar() {
    form.reset();
    campo('fechaCorte').value = hoy();
    mostrarErrores([]);
    cajaResultado.hidden = true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    calcular();
  });

  form.addEventListener('reset', function (e) {
    e.preventDefault();
    limpiar();
  });

  var botones = document.querySelectorAll('[data-ejemplo]');
  for (var i = 0; i < botones.length; i++) {
    botones[i].addEventListener('click', function (e) {
      var datos = EJEMPLOS[e.currentTarget.getAttribute('data-ejemplo')];
      if (!datos) return;
      llenar(datos);
      calcular();
    });
  }

  campo('fechaCorte').value = hoy();
})();
