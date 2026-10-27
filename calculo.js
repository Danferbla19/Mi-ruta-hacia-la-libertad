/* Mi ruta hacia la libertad - lógica del cálculo (sin interfaz)
   Estima cuánto tiempo lleva cumplido y cuánto falta para las fracciones 1/3, 3/5 y 4/5.
   Es una herramienta ORIENTATIVA: solo mide el requisito de tiempo. No decide beneficios.

   Convenciones usadas (por confirmar con quienes validan el proyecto):
   - 1 mes = 30 días y 1 año = 360 días, tanto para la pena como para los resultados.
   - El tiempo físico cuenta desde la fecha de inicio hasta la fecha de corte, incluyendo ambos días.
   - Tiempo cumplido = tiempo físico + redención reconocida (en días).
   - Cada umbral se redondea hacia arriba: pena x fracción, en días.

   Se puede usar en el navegador (window.CalculoPena) o en Node (require). */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CalculoPena = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIAS_MES = 30;
  var DIAS_ANIO = 360;
  var MS_DIA = 86400000;

  var FRACCIONES = [
    { id: 'tercio', num: 1, den: 3, etiqueta: '1/3', beneficio: 'permiso de hasta 72 horas' },
    { id: 'tres', num: 3, den: 5, etiqueta: '3/5', beneficio: 'libertad condicional' },
    { id: 'cuatro', num: 4, den: 5, etiqueta: '4/5', beneficio: 'permiso de salida y libertad preparatoria' }
  ];

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  /* 'AAAA-MM-DD' -> milisegundos UTC, o null si no es una fecha válida */
  function parseFecha(texto) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(texto || ''));
    if (!m) return null;
    var a = +m[1], mes = +m[2], d = +m[3];
    var t = Date.UTC(a, mes - 1, d);
    var f = new Date(t);
    if (f.getUTCFullYear() !== a || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) return null;
    return t;
  }

  /* milisegundos UTC -> 'DD/MM/AAAA' */
  function formatoFecha(t) {
    var f = new Date(t);
    return pad2(f.getUTCDate()) + '/' + pad2(f.getUTCMonth() + 1) + '/' + f.getUTCFullYear();
  }

  /* Entero >= 0. Vacío cuenta como 0. Devuelve NaN si no es válido. */
  function entero(v) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    if (!isFinite(n) || n < 0 || Math.floor(n) !== n) return NaN;
    return n;
  }

  /* Número >= 0 (admite decimales). Vacío cuenta como 0. */
  function numero(v) {
    if (v === '' || v === null || v === undefined) return 0;
    var n = Number(v);
    if (!isFinite(n) || n < 0) return NaN;
    return n;
  }

  function aDuracion(dias) {
    var total = Math.max(0, Math.round(dias));
    var anios = Math.floor(total / DIAS_ANIO);
    var resto = total - anios * DIAS_ANIO;
    var meses = Math.floor(resto / DIAS_MES);
    return { anios: anios, meses: meses, dias: resto - meses * DIAS_MES };
  }

  function plural(n, uno, varios) {
    return n + ' ' + (n === 1 ? uno : varios);
  }

  function textoDuracion(dias) {
    var d = aDuracion(dias);
    var partes = [];
    if (d.anios) partes.push(plural(d.anios, 'año', 'años'));
    if (d.meses) partes.push(plural(d.meses, 'mes', 'meses'));
    if (d.dias || !partes.length) partes.push(plural(d.dias, 'día', 'días'));
    if (partes.length === 1) return partes[0];
    return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
  }

  /* datos: { penaAnios, penaMeses, penaDias, fechaInicio, fechaCorte, redencionDias, ritmoRedencion }
     ritmoRedencion (opcional): días redimidos por mes que se espera seguir sumando. */
  function calcular(datos) {
    var errores = [];
    var d = datos || {};

    var pa = entero(d.penaAnios), pm = entero(d.penaMeses), pd = entero(d.penaDias);
    if (isNaN(pa) || isNaN(pm) || isNaN(pd)) {
      errores.push('La pena debe escribirse con números enteros, sin negativos.');
    }
    var penaDias = (pa || 0) * DIAS_ANIO + (pm || 0) * DIAS_MES + (pd || 0);
    if (!errores.length && penaDias <= 0) {
      errores.push('Escriba la pena impuesta (años, meses o días).');
    }

    var inicio = parseFecha(d.fechaInicio);
    var corte = parseFecha(d.fechaCorte);
    if (inicio === null) errores.push('Escriba una fecha de inicio válida.');
    if (corte === null) errores.push('Escriba una fecha de corte válida.');
    if (inicio !== null && corte !== null && inicio > corte) {
      errores.push('La fecha de inicio no puede ser posterior a la fecha de corte.');
    }

    var redencion = entero(d.redencionDias);
    if (isNaN(redencion)) errores.push('Los días de redención deben ser un número entero, sin negativos.');

    var ritmo = numero(d.ritmoRedencion);
    if (isNaN(ritmo)) errores.push('El ritmo de redención debe ser un número, sin negativos.');

    if (errores.length) return { ok: false, errores: errores };

    var fisico = Math.round((corte - inicio) / MS_DIA) + 1;
    var cumplido = fisico + redencion;
    var diasPorDia = 1 + ritmo / DIAS_MES;

    function proyectar(faltan) {
      if (faltan <= 0) return null;
      var diasCalendario = Math.ceil(faltan / diasPorDia - 1e-9);
      return corte + diasCalendario * MS_DIA;
    }

    var fracciones = FRACCIONES.map(function (f) {
      var umbral = Math.floor((penaDias * f.num + f.den - 1) / f.den);
      var faltan = Math.max(0, umbral - cumplido);
      var fecha = proyectar(faltan);
      return {
        id: f.id,
        etiqueta: f.etiqueta,
        beneficio: f.beneficio,
        umbral: umbral,
        alcanzada: cumplido >= umbral,
        faltan: faltan,
        avance: Math.min(100, (cumplido / umbral) * 100),
        fechaEstimada: fecha,
        fechaEstimadaTexto: fecha === null ? null : formatoFecha(fecha)
      };
    });

    var faltaPena = Math.max(0, penaDias - cumplido);
    var fechaPena = proyectar(faltaPena);

    return {
      ok: true,
      penaDias: penaDias,
      tiempoFisico: fisico,
      redencion: redencion,
      cumplido: cumplido,
      porcentaje: Math.min(100, (cumplido / penaDias) * 100),
      excedePena: cumplido > penaDias,
      faltaPena: faltaPena,
      fechaPenaTexto: fechaPena === null ? null : formatoFecha(fechaPena),
      fechaCorteTexto: formatoFecha(corte),
      ritmoRedencion: ritmo,
      fracciones: fracciones
    };
  }

  return {
    DIAS_MES: DIAS_MES,
    DIAS_ANIO: DIAS_ANIO,
    FRACCIONES: FRACCIONES,
    parseFecha: parseFecha,
    formatoFecha: formatoFecha,
    aDuracion: aDuracion,
    textoDuracion: textoDuracion,
    calcular: calcular
  };
});
