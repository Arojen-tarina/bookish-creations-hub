// Korttitekstit (es): n = nimi, d = kuvaus, e = efekti, c = hinta, s = lyhyt efekti kortin alaosaan.
import type { CardLocale } from './index.ts';

const cards: CardLocale = {
 "res-001": {
  "n": "Caballos mongoles",
  "d": "3 caballos",
  "e": "Recluta caballería",
  "s": "+3 caballos"
 },
 "res-002": {
  "n": "Manada de caballos salvajes",
  "d": "5 caballos",
  "e": "Gran reserva de caballos",
  "s": "+5 caballos"
 },
 "res-003": {
  "n": "Caballos de guerra",
  "d": "2 caballos entrenados",
  "e": "+1 ataque de caballería",
  "s": "+2 caballos"
 },
 "res-004": {
  "n": "Rancho de caballos",
  "d": "1 caballo por turno",
  "e": "Producción continua de caballos",
  "s": "+3 caballos"
 },
 "res-005": {
  "n": "Semental de la estepa",
  "d": "1 caballo especial",
  "e": "Montura para el jefe tribal (+1 movimiento)",
  "s": "+1 caballo especial"
 },
 "res-006": {
  "n": "Cuidado de caballos",
  "d": "2 caballos + cuidado",
  "e": "Los caballos no consumen comida",
  "s": "+2 caballos"
 },
 "res-007": {
  "n": "Manada de potros",
  "d": "4 caballos",
  "e": "Caballos nuevos",
  "s": "+4 caballos"
 },
 "res-008": {
  "n": "Caballos de caravana",
  "d": "3 caballos",
  "e": "Para comerciar",
  "s": "+3 caballos"
 },
 "res-009": {
  "n": "Caballo árabe persa",
  "d": "2 caballos veloces",
  "e": "+2 movimiento de caballería",
  "s": "+2 caballos"
 },
 "res-010": {
  "n": "Semental legendario",
  "d": "1 caballo mágico",
  "e": "El jefe tribal +2 en todas las batallas",
  "s": "+1 caballo especial"
 },
 "res-011": {
  "n": "Monedas de oro",
  "d": "3 oro",
  "e": "Medio de pago",
  "s": "+3 oro"
 },
 "res-012": {
  "n": "Cofre del tesoro",
  "d": "5 oro",
  "e": "Gran reserva de oro",
  "s": "+5 oro"
 },
 "res-013": {
  "n": "Moneda de seda",
  "d": "4 oro",
  "e": "Moneda china",
  "s": "+4 oro"
 },
 "res-014": {
  "n": "Riquezas saqueadas",
  "d": "6 oro",
  "e": "Botín de guerra",
  "s": "+6 oro"
 },
 "res-015": {
  "n": "Beneficios del mercader",
  "d": "3 oro + 1 por ruta comercial",
  "e": "Ganancias del comercio",
  "s": "+3 oro"
 },
 "res-017": {
  "n": "Mina de oro",
  "d": "2 oro por turno",
  "e": "Producción continua de oro",
  "s": "+5 oro"
 },
 "res-018": {
  "n": "Fondos de soborno",
  "d": "4 oro",
  "e": "Compra influencia",
  "s": "+4 oro"
 },
 "res-019": {
  "n": "Ingresos fiscales",
  "d": "1 oro por provincia controlada",
  "e": "Del sistema tributario",
  "s": "+3 oro"
 },
 "res-020": {
  "n": "Tesoro del Kan",
  "d": "10 oro",
  "e": "Inmensas riquezas",
  "s": "+10 oro"
 },
 "res-021": {
  "n": "Cosecha de grano",
  "d": "4 comida",
  "e": "Mantenimiento del ejército",
  "s": "+4 comida"
 },
 "res-022": {
  "n": "Carne de ganado",
  "d": "3 comida",
  "e": "Reserva de proteína",
  "s": "+3 comida"
 },
 "res-023": {
  "n": "Comida seca",
  "d": "5 comida",
  "e": "No se estropea",
  "s": "+5 comida"
 },
 "res-024": {
  "n": "Huerto",
  "d": "2 comida por turno",
  "e": "Producción continua",
  "s": "+4 comida"
 },
 "res-025": {
  "n": "Captura de pesca",
  "d": "4 comida",
  "e": "De las provincias fluviales",
  "s": "+4 comida"
 },
 "res-026": {
  "n": "Reservas de comida",
  "d": "6 comida",
  "e": "Reserva de emergencia",
  "s": "+6 comida"
 },
 "res-027": {
  "n": "Botín de caza",
  "d": "2 comida",
  "e": "De la caza",
  "s": "+2 comida"
 },
 "res-028": {
  "n": "Tecnología agrícola",
  "d": "+1 comida por tierras de cultivo",
  "e": "Cosecha mejorada",
  "s": "+3 comida"
 },
 "res-029": {
  "n": "Arrozales",
  "d": "3 comida",
  "e": "De la agricultura china",
  "s": "+3 comida"
 },
 "res-030": {
  "n": "Abundancia",
  "d": "8 comida",
  "e": "Cosecha enorme",
  "s": "+8 comida"
 },
 "res-031": {
  "n": "Herreros",
  "d": "2 artesanos",
  "e": "Forja de armas",
  "s": "+2 artesanos"
 },
 "res-032": {
  "n": "Ingenieros chinos",
  "d": "3 artesanos",
  "e": "Constructores de máquinas de asedio",
  "s": "+3 artesanos"
 },
 "res-033": {
  "n": "Maestros artesanos persas",
  "d": "4 artesanos",
  "e": "Trabajo de alta calidad",
  "s": "+4 artesanos"
 },
 "res-034": {
  "n": "Tejedores",
  "d": "2 artesanos",
  "e": "Producción textil",
  "s": "+2 artesanos"
 },
 "res-035": {
  "n": "Constructores",
  "d": "3 artesanos",
  "e": "Construcción de fortalezas",
  "s": "+3 artesanos"
 },
 "res-036": {
  "n": "Alfareros",
  "d": "1 artesano",
  "e": "Bienes comerciales",
  "s": "+1 artesano"
 },
 "res-037": {
  "n": "Talleres de plata",
  "d": "2 artesanos",
  "e": "Joyería",
  "s": "+2 artesanos"
 },
 "res-038": {
  "n": "Maestro armero",
  "d": "Artesanía legendaria",
  "e": "+1 ataque permanente",
  "s": "+3 artesanos"
 },
 "res-039": {
  "n": "Gremio de artesanos",
  "d": "1 artesano por turno",
  "e": "Producción continua",
  "s": "+4 artesanos"
 },
 "res-040": {
  "n": "Aprendices",
  "d": "1 artesano",
  "e": "Un novato",
  "s": "+1 artesano"
 },
 "res-041": {
  "n": "Rebaño de ovejas",
  "d": "4 ganado",
  "e": "Lana y carne",
  "s": "+4 comida"
 },
 "res-042": {
  "n": "Rebaño de reses",
  "d": "3 ganado",
  "e": "Animales de tiro y carne",
  "s": "+3 comida"
 },
 "res-043": {
  "n": "Caravana de camellos",
  "d": "5 ganado",
  "e": "Para comerciar en el desierto",
  "s": "+5 comida"
 },
 "res-044": {
  "n": "Rebaño de cabras",
  "d": "3 ganado",
  "e": "Leche y cuero",
  "s": "+3 comida"
 },
 "res-045": {
  "n": "Yaks",
  "d": "2 ganado",
  "e": "Animales de montaña",
  "s": "+2 comida"
 },
 "res-046": {
  "n": "Criadero de gusanos de seda",
  "d": "Bien especial",
  "e": "+2 oro del comercio",
  "s": "+2 oro"
 },
 "res-047": {
  "n": "Especias",
  "d": "Una rareza",
  "e": "+3 oro al comerciar",
  "s": "+3 oro"
 },
 "res-048": {
  "n": "Pieles",
  "d": "Valiosas",
  "e": "+2 oro del comercio",
  "s": "+2 oro"
 },
 "res-049": {
  "n": "Gemas",
  "d": "Diamantes y rubíes",
  "e": "+10 oro",
  "s": "+4 oro"
 },
 "res-050": {
  "n": "Tiara del Kan",
  "d": "Joyas reales",
  "e": "+20 oro",
  "s": "+8 oro"
 },
 "str-001": {
  "n": "Carga mongola",
  "d": "Asalto clásico de caballería",
  "e": "+3 ataque este turno",
  "s": "+3 ataque"
 },
 "str-006": {
  "n": "Lluvia de flechas",
  "d": "Descarga masiva de flechas",
  "e": "+1 ataque por unidad de caballería",
  "s": "+1 por caballería"
 },
 "str-008": {
  "n": "Táctico del caos",
  "d": "Siembra confusión en las filas enemigas",
  "e": "El enemigo pierde una unidad antes de la batalla",
  "s": "+4 ataque"
 },
 "str-010": {
  "n": "Juramento de sangre",
  "d": "Lucha hasta la muerte",
  "e": "+2 defensa, sin retirada",
  "s": "+2 defensa, sin retirada"
 },
 "str-011": {
  "n": "Frenesí de fuego",
  "d": "Flechas incendiarias",
  "e": "Destruye un edificio enemigo",
  "s": "destruye edificio"
 },
 "str-013": {
  "n": "Experiencia veterana",
  "d": "Los viejos guerreros guían",
  "e": "+1 a todas las unidades en batalla",
  "s": "+1 a todos en batalla"
 },
 "str-014": {
  "n": "Línea reforzada",
  "d": "Formación defensiva cerrada",
  "e": "+3 defensa este turno",
  "s": "+3 defensa"
 },
 "str-016": {
  "n": "Choque de caballería",
  "d": "El primer golpe lo decide",
  "e": "Primera batalla +3, resto +0",
  "s": "+3 en primer golpe"
 },
 "str-017": {
  "n": "Fosos trampa",
  "d": "Trampas ocultas en el terreno",
  "e": "El atacante pierde 1 unidad antes de la batalla",
  "s": "+2 defensa"
 },
 "str-018": {
  "n": "Soldados sombríos",
  "d": "Uso de espías",
  "e": "Mira la mano de cartas del enemigo",
  "s": "+1 reconocimiento"
 },
 "str-019": {
  "n": "La orden del Kan",
  "d": "Obediencia absoluta",
  "e": "Todas las unidades atacan juntas",
  "s": "+3 ataque conjunto"
 },
 "str-020": {
  "n": "Fuerza final",
  "d": "Un asalto desesperado",
  "e": "Duplica el ataque, pero pierdes la mitad de tus unidades",
  "s": "+5 ataque desesperado"
 },
 "str-021": {
  "n": "Refuerzo de muros",
  "d": "Reparaciones de fortaleza",
  "e": "+2 durabilidad de fortaleza",
  "s": "+2 fortaleza"
 },
 "str-022": {
  "n": "Desafío de los sitiados",
  "d": "¡No rendirse!",
  "e": "El asedio dura 2 turnos más",
  "s": "+2 defensa por 2 turnos"
 },
 "str-024": {
  "n": "Aceite hirviendo",
  "d": "Una táctica defensiva",
  "e": "+3 defensa contra asedio",
  "s": "+3 defensa contra asedio"
 },
 "str-025": {
  "n": "Guardias de la ciudad",
  "d": "Milicia ciudadana",
  "e": "Gana 2 unidades temporales de infantería",
  "s": "+2 defensa"
 },
 "str-026": {
  "n": "Escorpión",
  "d": "Un arma de asedio defensiva",
  "e": "+2 defensa, puede golpear una provincia adyacente",
  "s": "+2 defensa"
 },
 "str-027": {
  "n": "Muros de fuego",
  "d": "Una tormenta de fuego defensiva",
  "e": "El atacante pierde 1 unidad de caballería",
  "s": "+2 defensa"
 },
 "str-028": {
  "n": "Acopio de comida",
  "d": "Un asedio largo",
  "e": "Sin consumo de comida durante un asedio",
  "s": "+3 comida"
 },
 "str-032": {
  "n": "Curtidos en batalla",
  "d": "La experiencia da frutos",
  "e": "+2 defensa en territorio propio",
  "s": "+2 en territorio propio"
 },
 "str-033": {
  "n": "Resistencia al frío",
  "d": "Defensa invernal",
  "e": "Si es invierno: +4 defensa",
  "s": "+4 defensa invernal"
 },
 "str-034": {
  "n": "Dispersión del ejército",
  "d": "Tácticas de guerrilla",
  "e": "Divídete entre 3 provincias, el enemigo elige una para atacar",
  "s": "+2 defensa guerrillera"
 },
 "str-035": {
  "n": "El último muro",
  "d": "Muerte o victoria",
  "e": "Defensa x2, pero sin retirada",
  "s": "+5 defensa"
 },
 "str-051": {
  "n": "Espíritu de Gengis Kan",
  "d": "Inspiración del gran conquistador",
  "e": "Todas las unidades +2 ataque y defensa este turno",
  "s": "+2 a todos"
 },
 "str-054": {
  "n": "Pólvora china",
  "d": "Nueva tecnología en uso",
  "e": "Destruye automáticamente una fortaleza",
  "s": "destruye fortaleza"
 },
 "tek-001": {
  "n": "Arco compuesto",
  "d": "Tecnología de arco mejorada",
  "e": "+1 ataque de caballería permanentemente",
  "c": "2 artesanos",
  "s": "+1 ataque de caballería permanentemente"
 },
 "tek-002": {
  "n": "Caballería pesada",
  "d": "Caballos acorazados",
  "e": "+1 defensa de caballería permanentemente",
  "c": "2 artesanos + 2 caballos",
  "s": "+1 defensa de caballería permanentemente"
 },
 "tek-003": {
  "n": "Máquina de asedio",
  "d": "Máquina lanzapiedras",
  "e": "Las fortalezas tienen -1 defensa contra ti",
  "c": "3 artesanos",
  "s": "+2 contra fortalezas"
 },
 "tek-005": {
  "n": "Armadura de acero",
  "d": "Armadura mejorada",
  "e": "+1 defensa de infantería permanentemente",
  "c": "2 artesanos",
  "s": "+1 defensa de infantería permanentemente"
 },
 "tek-011": {
  "n": "Sistema tributario",
  "d": "Recaudación eficiente",
  "e": "+1 oro por provincia controlada",
  "c": "2 artesanos",
  "s": "+5 oro"
 },
 "tek-013": {
  "n": "Técnica agrícola",
  "d": "Cosecha mejorada",
  "e": "+1 comida por tierras de cultivo",
  "c": "1 artesano",
  "s": "+3 comida"
 },
 "tek-015": {
  "n": "Escritura",
  "d": "Registro escrito",
  "e": "+1 oro por turno",
  "c": "2 artesanos",
  "s": "+2 oro por turno"
 },
 "tek-024": {
  "n": "Metalurgia",
  "d": "Herramientas mejoradas",
  "e": "+1 velocidad de construcción",
  "c": "2 artesanos",
  "s": "+2 artesanos"
 },
 "tek-026": {
  "n": "Arquitectura",
  "d": "Maestría constructiva",
  "e": "Las fortalezas +1 durabilidad",
  "c": "2 artesanos",
  "s": "+1 durabilidad de fortaleza"
 },
 "tek-029": {
  "n": "Filosofía",
  "d": "El poder del pensamiento",
  "e": "+1 punto de victoria por cada 3 cartas de tecnología",
  "c": "2 artesanos",
  "s": "+3 oro"
 },
 "tek-030": {
  "n": "Ciencia universal",
  "d": "Todo el conocimiento unido",
  "e": "La victoria tecnológica se vuelve posible",
  "c": "5 artesanos + 5 oro",
  "s": "+10 oro"
 }
};

export default cards;
