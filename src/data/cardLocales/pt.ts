// Korttitekstit (pt): n = nimi, d = kuvaus, e = efekti, c = hinta, s = lyhyt efekti kortin alaosaan.
import type { CardLocale } from './index.ts';

const cards: CardLocale = {
 "res-001": {
  "n": "Cavalos Mongóis",
  "d": "3 cavalos",
  "e": "Recrute cavalaria",
  "s": "+3 cavalos"
 },
 "res-002": {
  "n": "Manada de Cavalos Selvagens",
  "d": "5 cavalos",
  "e": "Uma grande reserva de cavalos",
  "s": "+5 cavalos"
 },
 "res-003": {
  "n": "Cavalos de Guerra",
  "d": "2 cavalos treinados",
  "e": "+1 ataque de cavalaria",
  "s": "+2 cavalos"
 },
 "res-004": {
  "n": "Haras",
  "d": "1 cavalo por turno",
  "e": "Produção contínua de cavalos",
  "s": "+3 cavalos"
 },
 "res-005": {
  "n": "Garanhão da Estepe",
  "d": "1 cavalo especial",
  "e": "Montaria do chefe (+1 movimento)",
  "s": "+1 cavalo especial"
 },
 "res-006": {
  "n": "Cuidados com Cavalos",
  "d": "2 cavalos + cuidados",
  "e": "Cavalos não consomem comida",
  "s": "+2 cavalos"
 },
 "res-007": {
  "n": "Manada de Potros",
  "d": "4 cavalos",
  "e": "Cavalos novos",
  "s": "+4 cavalos"
 },
 "res-008": {
  "n": "Cavalos de Caravana",
  "d": "3 cavalos",
  "e": "Para uso comercial",
  "s": "+3 cavalos"
 },
 "res-009": {
  "n": "Cavalos Árabes Persas",
  "d": "2 cavalos velozes",
  "e": "+2 movimento de cavalaria",
  "s": "+2 cavalos"
 },
 "res-010": {
  "n": "Garanhão Lendário",
  "d": "1 cavalo mágico",
  "e": "Chefe +2 em todas as batalhas",
  "s": "+1 cavalo especial"
 },
 "res-011": {
  "n": "Moedas de Ouro",
  "d": "3 ouro",
  "e": "Meio de pagamento",
  "s": "+3 ouro"
 },
 "res-012": {
  "n": "Baú do Tesouro",
  "d": "5 ouro",
  "e": "Uma grande reserva de ouro",
  "s": "+5 ouro"
 },
 "res-013": {
  "n": "Moeda de Seda",
  "d": "4 ouro",
  "e": "Moeda chinesa",
  "s": "+4 ouro"
 },
 "res-014": {
  "n": "Riquezas Saqueadas",
  "d": "6 ouro",
  "e": "Despojos de guerra",
  "s": "+6 ouro"
 },
 "res-015": {
  "n": "Lucros do Mercador",
  "d": "3 ouro + 1 por rota comercial",
  "e": "Lucros do comércio",
  "s": "+3 ouro"
 },
 "res-017": {
  "n": "Mina de Ouro",
  "d": "2 ouro por turno",
  "e": "Produção contínua de ouro",
  "s": "+5 ouro"
 },
 "res-018": {
  "n": "Fundos de Corrupção",
  "d": "4 ouro",
  "e": "Compre influência",
  "s": "+4 ouro"
 },
 "res-019": {
  "n": "Receita Fiscal",
  "d": "1 ouro por província controlada",
  "e": "Do sistema tributário",
  "s": "+3 ouro"
 },
 "res-020": {
  "n": "Tesouro do Khan",
  "d": "10 ouro",
  "e": "Riquezas imensas",
  "s": "+10 ouro"
 },
 "res-021": {
  "n": "Colheita de Grãos",
  "d": "4 comida",
  "e": "Sustento do exército",
  "s": "+4 comida"
 },
 "res-022": {
  "n": "Carne de Gado",
  "d": "3 comida",
  "e": "Reserva de proteína",
  "s": "+3 comida"
 },
 "res-023": {
  "n": "Comida Seca",
  "d": "5 comida",
  "e": "Não estraga",
  "s": "+5 comida"
 },
 "res-024": {
  "n": "Pomar",
  "d": "2 comida por turno",
  "e": "Produção contínua",
  "s": "+4 comida"
 },
 "res-025": {
  "n": "Pescaria",
  "d": "4 comida",
  "e": "De províncias ribeirinhas",
  "s": "+4 comida"
 },
 "res-026": {
  "n": "Reservas de Comida",
  "d": "6 comida",
  "e": "Um estoque de emergência",
  "s": "+6 comida"
 },
 "res-027": {
  "n": "Espólios da Caça",
  "d": "2 comida",
  "e": "Da caça",
  "s": "+2 comida"
 },
 "res-028": {
  "n": "Tecnologia Agrícola",
  "d": "+1 comida por lavoura",
  "e": "Colheita melhorada",
  "s": "+3 comida"
 },
 "res-029": {
  "n": "Arrozais",
  "d": "3 comida",
  "e": "Da agricultura chinesa",
  "s": "+3 comida"
 },
 "res-030": {
  "n": "Abundância",
  "d": "8 comida",
  "e": "Uma colheita gigantesca",
  "s": "+8 comida"
 },
 "res-031": {
  "n": "Ferreiros",
  "d": "2 artesãos",
  "e": "Forja de armas",
  "s": "+2 artesãos"
 },
 "res-032": {
  "n": "Engenheiros Chineses",
  "d": "3 artesãos",
  "e": "Construtores de máquinas de cerco",
  "s": "+3 artesãos"
 },
 "res-033": {
  "n": "Mestres Artesãos Persas",
  "d": "4 artesãos",
  "e": "Trabalho de alta qualidade",
  "s": "+4 artesãos"
 },
 "res-034": {
  "n": "Tecelões",
  "d": "2 artesãos",
  "e": "Produção têxtil",
  "s": "+2 artesãos"
 },
 "res-035": {
  "n": "Construtores",
  "d": "3 artesãos",
  "e": "Construção de fortalezas",
  "s": "+3 artesãos"
 },
 "res-036": {
  "n": "Oleiros",
  "d": "1 artesão",
  "e": "Mercadorias",
  "s": "+1 artesão"
 },
 "res-037": {
  "n": "Oficinas de Prata",
  "d": "2 artesãos",
  "e": "Fabricação de joias",
  "s": "+2 artesãos"
 },
 "res-038": {
  "n": "Mestre Armeiro",
  "d": "Artesanato lendário",
  "e": "Bônus permanente de +1 ataque",
  "s": "+3 artesãos"
 },
 "res-039": {
  "n": "Guilda de Artesãos",
  "d": "1 artesão por turno",
  "e": "Produção contínua",
  "s": "+4 artesãos"
 },
 "res-040": {
  "n": "Aprendizes",
  "d": "1 artesão",
  "e": "Um novato",
  "s": "+1 artesão"
 },
 "res-041": {
  "n": "Rebanho de Ovelhas",
  "d": "4 animais de criação",
  "e": "Lã e carne",
  "s": "+4 comida"
 },
 "res-042": {
  "n": "Rebanho de Gado",
  "d": "3 animais de criação",
  "e": "Animais de tração e carne",
  "s": "+3 comida"
 },
 "res-043": {
  "n": "Caravana de Camelos",
  "d": "5 animais de criação",
  "e": "Para comércio no deserto",
  "s": "+5 comida"
 },
 "res-044": {
  "n": "Rebanho de Cabras",
  "d": "3 animais de criação",
  "e": "Leite e couro",
  "s": "+3 comida"
 },
 "res-045": {
  "n": "Iaques",
  "d": "2 animais de criação",
  "e": "Animais da montanha",
  "s": "+2 comida"
 },
 "res-046": {
  "n": "Bicho-da-Seda",
  "d": "Um bem especial",
  "e": "+2 ouro do comércio",
  "s": "+2 ouro"
 },
 "res-047": {
  "n": "Especiarias",
  "d": "Uma raridade",
  "e": "+3 ouro ao comerciar",
  "s": "+3 ouro"
 },
 "res-048": {
  "n": "Peles",
  "d": "Valiosas",
  "e": "+2 ouro do comércio",
  "s": "+2 ouro"
 },
 "res-049": {
  "n": "Gemas",
  "d": "Diamantes e rubis",
  "e": "+10 ouro",
  "s": "+4 ouro"
 },
 "res-050": {
  "n": "Tiara do Khan",
  "d": "Joias reais",
  "e": "+20 ouro",
  "s": "+8 ouro"
 },
 "str-001": {
  "n": "Carga Mongol",
  "d": "Ataque clássico de cavalaria",
  "e": "+3 bônus de ataque neste turno",
  "s": "+3 ataque"
 },
 "str-006": {
  "n": "Tempestade de Flechas",
  "d": "Voleio maciço de flechas",
  "e": "+1 ataque por unidade de cavalaria",
  "s": "+1 por cavalaria"
 },
 "str-008": {
  "n": "Tático do Caos",
  "d": "Semeie confusão nas fileiras inimigas",
  "e": "O inimigo perde uma unidade antes da batalha",
  "s": "+4 ataque"
 },
 "str-010": {
  "n": "Juramento de Sangue",
  "d": "Lute até a morte",
  "e": "+2 defesa, não pode recuar",
  "s": "+2 defesa, sem recuo"
 },
 "str-011": {
  "n": "Fúria de Fogo",
  "d": "Flechas em chamas",
  "e": "Destrua uma construção inimiga",
  "s": "destrua uma construção"
 },
 "str-013": {
  "n": "Experiência Veterana",
  "d": "Velhos guerreiros lideram",
  "e": "+1 a todas as unidades na batalha",
  "s": "+1 a todos na batalha"
 },
 "str-014": {
  "n": "Linha Reforçada",
  "d": "Formação defensiva cerrada",
  "e": "+3 defesa neste turno",
  "s": "+3 defesa"
 },
 "str-016": {
  "n": "Choque de Cavalaria",
  "d": "O primeiro golpe decide",
  "e": "Primeira batalha +3, demais +0",
  "s": "+3 no primeiro golpe"
 },
 "str-017": {
  "n": "Armadilhas de Fossa",
  "d": "Armadilhas escondidas no terreno",
  "e": "O atacante perde 1 unidade antes da batalha",
  "s": "+2 defesa"
 },
 "str-018": {
  "n": "Soldados das Sombras",
  "d": "Uso de espiões",
  "e": "Veja a mão de cartas do inimigo",
  "s": "+1 reconhecimento"
 },
 "str-019": {
  "n": "Ordem do Khan",
  "d": "Obediência absoluta",
  "e": "Todas as unidades atacam juntas",
  "s": "+3 ataque conjunto"
 },
 "str-020": {
  "n": "Última Força",
  "d": "Um assalto desesperado",
  "e": "Ataque em dobro, mas perca metade das suas unidades",
  "s": "+5 ataque desesperado"
 },
 "str-021": {
  "n": "Reforço dos Muros",
  "d": "Reparos na fortaleza",
  "e": "+2 durabilidade da fortaleza",
  "s": "+2 fortaleza"
 },
 "str-022": {
  "n": "Desafio dos Sitiados",
  "d": "Sem rendição!",
  "e": "O cerco dura 2 turnos a mais",
  "s": "+2 defesa por 2 turnos"
 },
 "str-024": {
  "n": "Óleo Fervente",
  "d": "Uma tática defensiva",
  "e": "+3 defesa contra cerco",
  "s": "+3 defesa contra cerco"
 },
 "str-025": {
  "n": "Guardas da Cidade",
  "d": "Milícia cidadã",
  "e": "Ganhe 2 unidades temporárias de infantaria",
  "s": "+2 defesa"
 },
 "str-026": {
  "n": "Escorpião",
  "d": "Uma arma de cerco defensiva",
  "e": "+2 defesa, pode atingir uma província adjacente",
  "s": "+2 defesa"
 },
 "str-027": {
  "n": "Muralhas de Fogo",
  "d": "Uma tempestade de fogo na defesa",
  "e": "O atacante perde 1 unidade de cavalaria",
  "s": "+2 defesa"
 },
 "str-028": {
  "n": "Estoque de Comida",
  "d": "Um longo cerco",
  "e": "Sem consumo de comida durante um cerco",
  "s": "+3 comida"
 },
 "str-032": {
  "n": "Endurecidos pela Batalha",
  "d": "A experiência compensa",
  "e": "+2 defesa em território próprio",
  "s": "+2 em território próprio"
 },
 "str-033": {
  "n": "Resistência ao Frio",
  "d": "Defesa de inverno",
  "e": "Se inverno: +4 defesa",
  "s": "+4 defesa de inverno"
 },
 "str-034": {
  "n": "Dispersão do Exército",
  "d": "Táticas de guerrilha",
  "e": "Divida-se por 3 províncias, o inimigo escolhe uma para atacar",
  "s": "+2 defesa de guerrilha"
 },
 "str-035": {
  "n": "A Última Muralha",
  "d": "Morte ou vitória",
  "e": "Defesa x2, mas sem recuo",
  "s": "+5 defesa"
 },
 "str-051": {
  "n": "Espírito de Gêngis Khan",
  "d": "Inspiração do grande conquistador",
  "e": "Todas as unidades +2 ataque e defesa neste turno",
  "s": "+2 para todos"
 },
 "str-054": {
  "n": "Pólvora Chinesa",
  "d": "Nova tecnologia em uso",
  "e": "Destrua automaticamente uma fortaleza",
  "s": "destrua uma fortaleza"
 },
 "tek-001": {
  "n": "Arco Composto",
  "d": "Tecnologia de arco aprimorada",
  "e": "+1 ataque de cavalaria permanentemente",
  "c": "2 artesãos",
  "s": "+1 ataque de cavalaria permanentemente"
 },
 "tek-002": {
  "n": "Cavalaria Pesada",
  "d": "Cavalos blindados",
  "e": "+1 defesa de cavalaria permanentemente",
  "c": "2 artesãos + 2 cavalos",
  "s": "+1 defesa de cavalaria permanentemente"
 },
 "tek-003": {
  "n": "Máquina de Cerco",
  "d": "Uma máquina que lança pedras",
  "e": "Fortalezas -1 defesa contra você",
  "c": "3 artesãos",
  "s": "+2 contra fortalezas"
 },
 "tek-005": {
  "n": "Armadura de Aço",
  "d": "Armadura aprimorada",
  "e": "+1 defesa de infantaria permanentemente",
  "c": "2 artesãos",
  "s": "+1 defesa de infantaria permanentemente"
 },
 "tek-011": {
  "n": "Sistema Tributário",
  "d": "Coleta de impostos eficiente",
  "e": "+1 ouro por província controlada",
  "c": "2 artesãos",
  "s": "+5 ouro"
 },
 "tek-013": {
  "n": "Técnica Agrícola",
  "d": "Colheita melhorada",
  "e": "+1 comida por lavoura",
  "c": "1 artesão",
  "s": "+3 comida"
 },
 "tek-015": {
  "n": "Alfabetização",
  "d": "Registro escrito",
  "e": "+1 ouro por turno",
  "c": "2 artesãos",
  "s": "+2 ouro por turno"
 },
 "tek-024": {
  "n": "Metalurgia",
  "d": "Ferramentas aprimoradas",
  "e": "+1 velocidade de construção",
  "c": "2 artesãos",
  "s": "+2 artesãos"
 },
 "tek-026": {
  "n": "Arquitetura",
  "d": "Especialização em construção",
  "e": "Fortalezas +1 durabilidade",
  "c": "2 artesãos",
  "s": "+1 durabilidade de fortaleza"
 },
 "tek-029": {
  "n": "Filosofia",
  "d": "O poder do pensamento",
  "e": "+1 ponto de vitória por 3 cartas de tecnologia",
  "c": "2 artesãos",
  "s": "+3 ouro"
 },
 "tek-030": {
  "n": "Ciência Universal",
  "d": "Todo conhecimento unido",
  "e": "A vitória tecnológica se torna possível",
  "c": "5 artesãos + 5 ouro",
  "s": "+10 ouro"
 }
};

export default cards;
