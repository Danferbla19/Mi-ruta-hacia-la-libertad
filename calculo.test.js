/* Pruebas de js/calculo.js
   Ejecutar con:  node tests/calculo.test.js
   Los resultados esperados se calcularon a mano, contando los días del calendario,
   para no depender de la propia función. */

'use strict';
var assert = require('assert');
var C = require('../js/calculo.js');

var pasadas = 0;
function prueba(nombre, fn) {
  fn();
  pasadas++;
  console.log('ok  - ' + nombre);
}

/* Caso A: 6 años, inicio 01/06/2025, corte 26/10/2026, 30 días de redención.
   Tiempo físico: 365 (hasta 01/06/2026) + 147 + 1 (día de inicio) = 513. */
prueba('Caso A: tiempo físico, cumplido y faltante para 1/3', function () {
  var r = C.calcular({ penaAnios: 6, fechaInicio: '2025-06-01', fechaCorte: '2026-10-26', redencionDias: 30 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.penaDias, 2160);
  assert.strictEqual(r.tiempoFisico, 513);
  assert.strictEqual(r.cumplido, 543);
  var tercio = r.fracciones[0];
  assert.strictEqual(tercio.umbral, 720);
  assert.strictEqual(tercio.alcanzada, false);
  assert.strictEqual(tercio.faltan, 177);
  assert.strictEqual(tercio.fechaEstimadaTexto, '21/04/2027');
});

prueba('Caso A con ritmo de redención de 15 días por mes adelanta la fecha', function () {
  var r = C.calcular({ penaAnios: 6, fechaInicio: '2025-06-01', fechaCorte: '2026-10-26', redencionDias: 30, ritmoRedencion: 15 });
  assert.strictEqual(r.fracciones[0].fechaEstimadaTexto, '21/02/2027');
});

/* Caso B: 10 años, inicio 10/03/2022, corte 26/10/2026, 300 días de redención.
   Tiempo físico: 1461 + 230 + 1 = 1692. Cumplido: 1992. */
prueba('Caso B: 1/3 alcanzada, 3/5 y 4/5 pendientes', function () {
  var r = C.calcular({ penaAnios: 10, fechaInicio: '2022-03-10', fechaCorte: '2026-10-26', redencionDias: 300 });
  assert.strictEqual(r.penaDias, 3600);
  assert.strictEqual(r.tiempoFisico, 1692);
  assert.strictEqual(r.cumplido, 1992);
  assert.strictEqual(r.fracciones[0].umbral, 1200);
  assert.strictEqual(r.fracciones[0].alcanzada, true);
  assert.strictEqual(r.fracciones[1].umbral, 2160);
  assert.strictEqual(r.fracciones[1].faltan, 168);
  assert.strictEqual(r.fracciones[2].umbral, 2880);
  assert.strictEqual(r.fracciones[2].faltan, 888);
});

/* Caso C: 5 años, inicio 01/10/2022, corte 26/10/2026, 240 días de redención.
   Tiempo físico: 1461 + 25 + 1 = 1487. Cumplido: 1727. Umbral 4/5 = 1440. */
prueba('Caso C: las tres fracciones alcanzadas y faltan 73 días para la pena', function () {
  var r = C.calcular({ penaAnios: 5, fechaInicio: '2022-10-01', fechaCorte: '2026-10-26', redencionDias: 240 });
  assert.strictEqual(r.tiempoFisico, 1487);
  assert.strictEqual(r.cumplido, 1727);
  r.fracciones.forEach(function (f) { assert.strictEqual(f.alcanzada, true); });
  assert.strictEqual(r.faltaPena, 73);
});

prueba('La pena puede escribirse en años, meses y días', function () {
  var r = C.calcular({ penaAnios: 2, penaMeses: 6, penaDias: 15, fechaInicio: '2026-01-01', fechaCorte: '2026-01-01' });
  assert.strictEqual(r.penaDias, 2 * 360 + 6 * 30 + 15);
  assert.strictEqual(r.tiempoFisico, 1);
});

prueba('El umbral se redondea hacia arriba (100 días x 1/3 = 34)', function () {
  var r = C.calcular({ penaDias: 100, fechaInicio: '2026-01-01', fechaCorte: '2026-01-01' });
  assert.strictEqual(r.fracciones[0].umbral, 34);
  assert.strictEqual(r.fracciones[1].umbral, 60);
  assert.strictEqual(r.fracciones[2].umbral, 80);
});

prueba('Alcanzar el umbral exacto cuenta como alcanzado', function () {
  /* pena de 30 días: 1/3 = 10 días; con 10 días de tiempo físico queda justo en el umbral */
  var r = C.calcular({ penaDias: 30, fechaInicio: '2026-01-01', fechaCorte: '2026-01-10' });
  assert.strictEqual(r.tiempoFisico, 10);
  assert.strictEqual(r.fracciones[0].alcanzada, true);
  assert.strictEqual(r.fracciones[0].faltan, 0);
});

prueba('Si el cumplido supera la pena, el porcentaje se limita a 100 y se avisa', function () {
  var r = C.calcular({ penaDias: 30, fechaInicio: '2026-01-01', fechaCorte: '2026-01-20', redencionDias: 30 });
  assert.strictEqual(r.porcentaje, 100);
  assert.strictEqual(r.excedePena, true);
  assert.strictEqual(r.faltaPena, 0);
});

prueba('Validaciones: sin pena, fechas al revés, fecha inválida y negativos', function () {
  assert.strictEqual(C.calcular({ fechaInicio: '2026-01-01', fechaCorte: '2026-02-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1, fechaInicio: '2026-03-01', fechaCorte: '2026-02-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1, fechaInicio: '2026-02-30', fechaCorte: '2026-03-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: -1, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01' }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01', redencionDias: -5 }).ok, false);
  assert.strictEqual(C.calcular({ penaAnios: 1.5, fechaInicio: '2026-01-01', fechaCorte: '2026-02-01' }).ok, false);
});

prueba('Textos de duración', function () {
  assert.strictEqual(C.textoDuracion(0), '0 días');
  assert.strictEqual(C.textoDuracion(1), '1 día');
  assert.strictEqual(C.textoDuracion(177), '5 meses y 27 días');
  assert.strictEqual(C.textoDuracion(360), '1 año');
  assert.strictEqual(C.textoDuracion(2160 + 33), '6 años, 1 mes y 3 días');
});

console.log('\n' + pasadas + ' pruebas pasaron.');
