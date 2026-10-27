/* Mi ruta hacia la libertad - comportamiento del sitio
   1) Selector de fracciones (1/3, 3/5, 4/5): barra del inicio + sección de detalle.
   2) Menú desplegable en móvil.
   Para editar el contenido de las fracciones, modifique el objeto FRACCIONES. */

(function () {
  'use strict';

  var ORDEN = ['tercio', 'tres', 'cuatro'];

  var FRACCIONES = {
    tercio: {
      etiqueta: '1/3',
      pct: 33.33,
      color: '#1F3A63',
      corto: 'permiso de salida de hasta 72 horas',
      filas: [
        ['Qué significa', 'Haber descontado la tercera parte de la pena impuesta. Es un requisito, no el único.'],
        ['Beneficio relacionado', 'Permiso de hasta 72 horas para salir del establecimiento, sin vigilancia.'],
        ['Otros requisitos', 'Los demás del artículo 147 y su reglamentación, como la fase del tratamiento y la conducta. [Por confirmar]'],
        ['Documentos útiles', 'Cómputo de la pena y redenciones, certificado de conducta, concepto del Consejo de Disciplina o del CET. [Por confirmar]'],
        ['Quién interviene', 'La Dirección del INPEC, a través del establecimiento.'],
        ['Qué puede impedirlo', 'Restricciones legales según el delito, órdenes de captura y mala conducta en permisos anteriores, que puede suspender los permisos hasta por seis meses.'],
        ['Norma', 'Ley 65 de 1993, artículo 147.']
      ]
    },
    tres: {
      etiqueta: '3/5',
      pct: 60,
      color: '#8C6A2F',
      corto: 'libertad condicional',
      filas: [
        ['Qué significa', 'Haber cumplido las tres quintas partes de la pena.'],
        ['Beneficio relacionado', 'Libertad condicional, que el juez concede o niega tras valorar el caso.'],
        ['Otros requisitos', 'Adecuado desempeño y comportamiento durante el tratamiento, arraigo familiar y social, y las condiciones sobre reparación a la víctima.'],
        ['Documentos útiles', 'Cómputo de la pena y redenciones, concepto del Consejo de Disciplina, soportes de arraigo. [Por confirmar]'],
        ['Quién interviene', 'El juez de ejecución de penas y medidas de seguridad. El establecimiento aporta la documentación.'],
        ['Qué puede impedirlo', 'Un concepto desfavorable del Consejo de Disciplina, la falta de arraigo o no cumplir lo exigido sobre la víctima.'],
        ['Norma', 'Código Penal, artículo 64, modificado por el artículo 30 de la Ley 1709 de 2014.']
      ]
    },
    cuatro: {
      etiqueta: '4/5',
      pct: 80,
      color: '#7A1F2B',
      corto: 'permiso de salida de hasta 15 días y libertad preparatoria',
      filas: [
        ['Qué significa', 'Haber cumplido las cuatro quintas partes de la condena. No abre la libertad de forma automática.'],
        ['Beneficio relacionado', 'Permiso de salida sin vigilancia por 15 días continuos, hasta 60 días al año, para quien ya se negó la libertad condicional. También la libertad preparatoria para trabajar.'],
        ['Otros requisitos', 'Buena conducta certificada por el Consejo de Disciplina y no tener orden de captura vigente. La libertad preparatoria exige además que el sistema progresivo lo permita.'],
        ['Documentos útiles', 'Certificado de conducta, cómputo de la pena, constancia sobre órdenes de captura. [Por confirmar]'],
        ['Quién interviene', 'El Director Regional del INPEC en el permiso de salida. En la libertad preparatoria, el Consejo de Disciplina y el Director del INPEC.'],
        ['Qué puede impedirlo', 'Mala conducta o retraso al volver de un permiso, que lo suspende seis meses, o de forma definitiva si se comete otro delito o una contravención especial de Policía.'],
        ['Norma', 'Ley 65 de 1993, artículos 147A y 148.']
      ]
    }
  };

  var seleccion = 'tercio';

  var barra = document.getElementById('barra');
  var relleno = document.getElementById('relleno');
  var resumen = document.getElementById('resumen-hero');
  var pestanas = document.getElementById('pestanas');
  var detalle = document.getElementById('detalle');
  var detalleTitulo = document.getElementById('detalle-titulo');
  var detalleSub = document.getElementById('detalle-sub');
  var detalleFilas = document.getElementById('detalle-filas');

  function crearBoton(id, clase) {
    var d = FRACCIONES[id];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = clase;
    b.textContent = d.etiqueta;
    b.dataset.id = id;
    b.style.setProperty('--frac', d.color);
    if (clase === 'marker') {
      b.style.left = d.pct + '%';
      b.setAttribute('aria-label', 'Fracción ' + d.etiqueta);
    }
    b.addEventListener('click', function () { elegir(id); });
    return b;
  }

  function dibujarFilas(filas) {
    detalleFilas.textContent = '';
    filas.forEach(function (par) {
      var fila = document.createElement('div');
      fila.className = 'detail-row';
      var k = document.createElement('div');
      k.className = 'detail-key';
      k.textContent = par[0];
      var v = document.createElement('div');
      v.className = 'detail-val';
      v.textContent = par[1];
      fila.appendChild(k);
      fila.appendChild(v);
      detalleFilas.appendChild(fila);
    });
  }

  function elegir(id) {
    seleccion = id;
    var d = FRACCIONES[id];

    relleno.style.width = d.pct + '%';
    relleno.style.setProperty('--frac', d.color);
    resumen.textContent = d.etiqueta + ' de la pena: ' + d.corto;

    detalle.style.setProperty('--frac', d.color);
    detalleTitulo.textContent = d.etiqueta + ' de la pena';
    detalleSub.textContent = d.corto;
    dibujarFilas(d.filas);

    var botones = document.querySelectorAll('.marker, .tab');
    for (var i = 0; i < botones.length; i++) {
      botones[i].setAttribute('aria-pressed', botones[i].dataset.id === id ? 'true' : 'false');
    }
  }

  ORDEN.forEach(function (id) {
    barra.appendChild(crearBoton(id, 'marker'));
    pestanas.appendChild(crearBoton(id, 'tab'));
  });
  elegir(seleccion);

  /* Menú en móvil */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var abierto = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();
