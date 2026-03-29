// /**
//  * GameUI.tsx — Pelin käyttöliittymäpaneeli (HUD)
//  *
//  * Pelin oikean laidan ohjauspaneeli, joka näyttää:
//  * - Vuoro- ja vaiheilmaisin (suunnittelu → toiminta → rakennus → tapahtuma → hallinto)
//  * - Pelaajan resurssit (kulta, ruoka, hevoset, rauta, silkki)
//  * - Rakennusvalikko (linnoitukset, markkinat, temppeli jne.)
//  * - Rekrytointivalikko (ratsuväki, jalkaväki)
//  * - Valtakunnan tilastot (alueet, kaupungit, pisteet)
//  * - Tapahtumaloki ja pelaajien lista
//  * - Voitto- ja tapahtumamodaalit
//  */
// import { GameState, GamePhase, BuildingType, FACTIONS, RESOURCE_INFO, BUILDING_INFO, UNIT_INFO, AI_PERSONALITIES } from '@/types/game';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
// import {
//   ScrollText,
//   Swords,
//   Building,
//   Sparkles,
//   ArrowRight,
//   Trophy,
//   Map,
//   Users,
//   RotateCcw,
//   Hammer,
//   Brain,
//   ChevronLeft,
//   ChevronRight,
//   Zap,
//   Clock,
// } from 'lucide-react';
//
// interface GameUIProps {
//   gameState: GameState;
//   onEndPhase: () => void;
//   onReset: () => void;
//   onBuild: (hexId: string, buildingType: BuildingType) => void;
//   onRecruit: (hexId: string, unitType: 'cavalry' | 'infantry') => void;
//   onResolveEvent: () => void;
//   onRotateLeft: () => void;
//   onRotateRight: () => void;
// }
//
// const PHASE_INFO: Record<GamePhase, { name: string; icon: React.ReactNode; description: string; color: string }> = {
//   planning: {
//     name: 'Suunnitteluvaihe',
//     icon: <ScrollText className="w-5 h-5" />,
//     description: 'Valitse strategiasi tälle vuorolle',
//     color: 'bg-blue-600',
//   },
//   action: {
//     name: 'Toimintavaihe',
//     icon: <Swords className="w-5 h-5" />,
//     description: 'Liikuta yksiköitä ja hyökkää',
//     color: 'bg-red-600',
//   },
//   building: {
//     name: 'Rakennusvaihe',
//     icon: <Hammer className="w-5 h-5" />,
//     description: 'Rakenna linnoituksia ja rakennuksia',
//     color: 'bg-amber-600',
//   },
//   event: {
//     name: 'Tapahtumavaihe',
//     icon: <Sparkles className="w-5 h-5" />,
//     description: 'Satunnaiset tapahtumat',
//     color: 'bg-purple-600',
//   },
//   management: {
//     name: 'Hallintovaihe',
//     icon: <Building className="w-5 h-5" />,
//     description: 'Kerää resurssit alueiltasi',
//     color: 'bg-green-600',
//   },
// };
//
// export const GameUI = ({
//   gameState,
//   onEndPhase,
//   onReset,
//   onBuild,
//   onRecruit,
//   onResolveEvent,
//   onRotateLeft,
//   onRotateRight,
// }: GameUIProps) => {
//   const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
//   if (!currentPlayer) return null;
//
//   const faction = FACTIONS[currentPlayer.factionId];
//   const phaseInfo = PHASE_INFO[gameState.currentPhase];
//   const selectedHex = gameState.hexes.find(h => h.id === gameState.selectedHexId);
//   const selectedUnit = gameState.units.find(u => u.id === gameState.selectedUnitId);
//   const isPlayerTurn = !currentPlayer.isAI;
//
//   // Available buildings for selected hex
//   const canBuildOnHex = selectedHex &&
//     selectedHex.ownerId === currentPlayer.factionId &&
//     selectedHex.buildings.length === 0 &&
//     gameState.currentPhase === 'building';
//
//   return (
//     <div className="space-y-4">
//       {/* Victory screen */}
//       {gameState.gameOver && (
//         <Dialog open={gameState.gameOver}>
//           <DialogContent className="bg-gradient-to-br from-amber-900 to-amber-950 border-amber-600 text-white">
//             <DialogHeader>
//               <div className="flex justify-center mb-4">
//                 <Trophy className="w-20 h-20 text-amber-400 animate-pulse" />
//               </div>
//               <DialogTitle className="text-3xl text-center text-amber-100">Peli päättyi!</DialogTitle>
//               <DialogDescription className="text-center text-amber-200 text-lg">
//                 {gameState.winCondition}
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter className="justify-center">
//               <Button onClick={onReset} size="lg" className="bg-amber-600 hover:bg-amber-500">
//                 <RotateCcw className="w-5 h-5 mr-2" />
//                 Pelaa uudestaan
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}
//
//       {/* Event Modal */}
//       {gameState.showEventModal && gameState.currentEvent && (
//         <Dialog open={gameState.showEventModal}>
//           <DialogContent className="bg-gradient-to-br from-purple-900 to-purple-950 border-purple-600 text-white max-w-md">
//             <DialogHeader>
//               <div className="flex justify-center mb-4">
//                 <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
//                   <Sparkles className="w-10 h-10 text-white" />
//                 </div>
//               </div>
//               <DialogTitle className="text-2xl text-center text-purple-100">
//                 {gameState.currentEvent.name}
//               </DialogTitle>
//               <DialogDescription className="text-center text-purple-200 text-base">
//                 {gameState.currentEvent.description}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="bg-purple-800/50 rounded-lg p-4 my-4">
//               <p className="text-purple-100 text-center font-medium">
//                 {gameState.currentEvent.effect}
//               </p>
//               <p className="text-purple-300 text-sm text-center mt-2">
//                 Kesto: {gameState.currentEvent.duration} vuoroa
//               </p>
//             </div>
//             <DialogFooter className="justify-center">
//               <Button onClick={onResolveEvent} size="lg" className="bg-purple-600 hover:bg-purple-500">
//                 <Zap className="w-5 h-5 mr-2" />
//                 Suorita tapahtuma
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}
//
//       {/* Camera controls */}
//       <div className="flex justify-center gap-2">
//         <Button variant="outline" size="sm" onClick={onRotateLeft} className="border-amber-700/50 text-amber-200">
//           <ChevronLeft className="w-4 h-4" />
//           Kierrä
//         </Button>
//         <Button variant="outline" size="sm" onClick={onRotateRight} className="border-amber-700/50 text-amber-200">
//           Kierrä
//           <ChevronRight className="w-4 h-4" />
//         </Button>
//       </div>
//
//       {/* Turn and Phase indicator */}
//       <Card className="bg-gradient-to-br from-amber-950/80 to-stone-950/80 border-amber-700/50 backdrop-blur">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between mb-3">
//             <div className="flex items-center gap-2">
//               <Badge variant="outline" className="text-amber-200 border-amber-500 bg-amber-900/30">
//                 <Clock className="w-3 h-3 mr-1" />
//                 Vuoro {gameState.turn}/{gameState.maxTurns}
//               </Badge>
//             </div>
//             <div className="flex items-center gap-2">
//               <span
//                 className="w-4 h-4 rounded-full shadow-lg"
//                 style={{ backgroundColor: faction.color, boxShadow: `0 0 10px ${faction.color}` }}
//               />
//               <span className="text-amber-100 font-bold">{faction.name}</span>
//               {currentPlayer.isAI && (
//                 <Badge variant="secondary" className="bg-stone-700 text-stone-200">
//                   <Brain className="w-3 h-3 mr-1" />
//                   AI
//                 </Badge>
//               )}
//             </div>
//           </div>
//
//           {/* Phase indicator */}
//           <div className={`flex items-center gap-2 text-white p-2 rounded-lg mb-3 ${phaseInfo.color}`}>
//             {phaseInfo.icon}
//             <span className="font-bold">{phaseInfo.name}</span>
//           </div>
//           <p className="text-sm text-amber-200/60 mb-3">{phaseInfo.description}</p>
//
//           {/* AI thinking indicator */}
//           {gameState.aiThinking && (
//             <div className="flex items-center gap-2 text-purple-300 mb-3 animate-pulse">
//               <Brain className="w-4 h-4" />
//               <span className="text-sm">AI suunnittelee siirtoaan...</span>
//             </div>
//           )}
//
//           {/* Last AI actions */}
//           {gameState.lastAIActions.length > 0 && currentPlayer.isAI && (
//             <div className="bg-stone-800/50 rounded-lg p-2 mb-3">
//               <p className="text-xs text-stone-400 mb-1">AI:n viimeiset toiminnot:</p>
//               {gameState.lastAIActions.slice(0, 2).map((action, i) => (
//                 <p key={i} className="text-xs text-amber-200/70">{action.reasoning}</p>
//               ))}
//             </div>
//           )}
//
//           <Button
//             onClick={onEndPhase}
//             className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-lg"
//             disabled={gameState.gameOver || gameState.aiThinking || gameState.showEventModal}
//           >
//             Seuraava vaihe
//             <ArrowRight className="w-4 h-4 ml-2" />
//           </Button>
//         </CardContent>
//       </Card>
//
//       {/* Active Events */}
//       {gameState.activeEvents.length > 0 && (
//         <Card className="bg-purple-950/50 border-purple-700/50">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-purple-100 text-sm flex items-center gap-2">
//               <Sparkles className="w-4 h-4" />
//               Aktiiviset tapahtumat
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="py-2">
//             {gameState.activeEvents.map((ae, i) => (
//               <div key={i} className="text-xs text-purple-200/70 flex justify-between">
//                 <span>{ae.event.name}</span>
//                 <span>{ae.turnsRemaining} vuoroa</span>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       )}
//
//       {/* Resources */}
//       <Card className="bg-gradient-to-br from-amber-950/80 to-stone-950/80 border-amber-700/50 backdrop-blur">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
//             <Building className="w-5 h-5" />
//             Resurssit
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-5 gap-2">
//             {(Object.entries(currentPlayer.resources) as [keyof typeof RESOURCE_INFO, number][]).map(([key, value]) => (
//               <div key={key} className="text-center bg-stone-800/50 rounded-lg p-2">
//                 <span className="text-2xl">{RESOURCE_INFO[key].emoji}</span>
//                 <p className="text-lg font-bold text-amber-100">{value}</p>
//                 <p className="text-[10px] text-amber-200/60">{RESOURCE_INFO[key].name}</p>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//
//       {/* Build Menu */}
//       {canBuildOnHex && isPlayerTurn && (
//         <Card className="bg-gradient-to-br from-amber-900/80 to-stone-900/80 border-amber-600/50 backdrop-blur">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
//               <Hammer className="w-5 h-5" />
//               Rakenna ({selectedHex.regionName})
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-2">
//               {(Object.entries(BUILDING_INFO) as [BuildingType, typeof BUILDING_INFO[BuildingType]][]).map(([type, info]) => {
//                 const canAfford = Object.entries(info.cost).every(
//                   ([resource, amount]) => currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= (amount || 0)
//                 );
//
//                 return (
//                   <Button
//                     key={type}
//                     variant="outline"
//                     className={`flex flex-col h-auto p-2 ${canAfford ? 'border-amber-500 hover:bg-amber-900/30' : 'opacity-50 border-stone-600'}`}
//                     onClick={() => canAfford && onBuild(selectedHex.id, type)}
//                     disabled={!canAfford}
//                   >
//                     <span className="text-xl">{info.emoji}</span>
//                     <span className="text-xs font-bold text-amber-100">{info.name}</span>
//                     <span className="text-[10px] text-amber-200/60">
//                       {Object.entries(info.cost).map(([r, a]) => `${RESOURCE_INFO[r as keyof typeof RESOURCE_INFO].emoji}${a}`).join(' ')}
//                     </span>
//                   </Button>
//                 );
//               })}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//
//       {/* Recruit Menu */}
//       {selectedHex && selectedHex.ownerId === currentPlayer.factionId && gameState.currentPhase === 'action' && isPlayerTurn && (
//         <Card className="bg-gradient-to-br from-red-950/80 to-stone-950/80 border-red-700/50 backdrop-blur">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-red-100 text-lg flex items-center gap-2">
//               <Users className="w-5 h-5" />
//               Rekrytoi
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-2">
//               {(['cavalry', 'infantry'] as const).map(unitType => {
//                 const info = UNIT_INFO[unitType];
//                 const canAfford = Object.entries(info.cost).every(
//                   ([resource, amount]) => currentPlayer.resources[resource as keyof typeof currentPlayer.resources] >= amount
//                 );
//
//                 return (
//                   <Button
//                     key={unitType}
//                     variant="outline"
//                     className={`flex flex-col h-auto p-2 ${canAfford ? 'border-red-500 hover:bg-red-900/30' : 'opacity-50 border-stone-600'}`}
//                     onClick={() => canAfford && onRecruit(selectedHex.id, unitType)}
//                     disabled={!canAfford}
//                   >
//                     <span className="text-xl">{info.emoji}</span>
//                     <span className="text-xs font-bold text-red-100">{info.name}</span>
//                     <span className="text-[10px] text-red-200/60">
//                       {Object.entries(info.cost).filter(([, a]) => a > 0).map(([r, a]) => `${RESOURCE_INFO[r as keyof typeof RESOURCE_INFO].emoji}${a}`).join(' ')}
//                     </span>
//                   </Button>
//                 );
//               })}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//
//       {/* Stats */}
//       <Card className="bg-gradient-to-br from-amber-950/80 to-stone-950/80 border-amber-700/50 backdrop-blur">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
//             <Map className="w-5 h-5" />
//             Valtakunta
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 gap-3 text-sm">
//             <div className="flex justify-between bg-stone-800/30 p-2 rounded">
//               <span className="text-amber-200/70">🗺️ Alueet:</span>
//               <span className="text-amber-100 font-bold">{currentPlayer.territoriesControlled}</span>
//             </div>
//             <div className="flex justify-between bg-stone-800/30 p-2 rounded">
//               <span className="text-amber-200/70">🏰 Kaupungit:</span>
//               <span className="text-amber-100 font-bold">{currentPlayer.citiesControlled}</span>
//             </div>
//             <div className="flex justify-between bg-stone-800/30 p-2 rounded">
//               <span className="text-amber-200/70">🛤️ Reitit:</span>
//               <span className="text-amber-100 font-bold">{currentPlayer.tradeRoutes}</span>
//             </div>
//             <div className="flex justify-between bg-stone-800/30 p-2 rounded">
//               <span className="text-amber-200/70">⭐ Pisteet:</span>
//               <span className="text-amber-100 font-bold">{currentPlayer.victoryPoints}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//
//       {/* Selected hex info */}
//       {selectedHex && (
//         <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-stone-700/50 backdrop-blur">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-stone-100 text-base flex items-center gap-2">
//               {selectedHex.terrain === 'city' ? '🏰' : RESOURCE_INFO[Object.keys(selectedHex.resourceProduction)[0] as keyof typeof RESOURCE_INFO]?.emoji || '📍'}
//               {selectedHex.regionName}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="text-sm text-stone-300 space-y-1">
//             <p>Maasto: {selectedHex.terrain}</p>
//             <p>Omistaja: {selectedHex.ownerId ? FACTIONS[selectedHex.ownerId].name : 'Neutraali'}</p>
//             <p>Puolustus: +{selectedHex.defenseBonus}</p>
//             {selectedUnit && (
//               <div className="mt-2 pt-2 border-t border-stone-700">
//                 <p className="text-amber-100 font-semibold">Valittu: {UNIT_INFO[selectedUnit.type].name}</p>
//                 <p>❤️ {selectedUnit.health}/{selectedUnit.maxHealth} | 👟 {selectedUnit.movementLeft}</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}
//
//       {/* Combat & Event Log */}
//       <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-stone-700/50 backdrop-blur">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-stone-100 text-lg flex items-center gap-2">
//             <Swords className="w-5 h-5" />
//             Tapahtumaloki
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ScrollArea className="h-32">
//             <div className="space-y-2">
//               {[...gameState.eventLog, ...gameState.combatLog.map(c => ({
//                 id: c.id,
//                 turn: c.turn,
//                 type: 'combat' as const,
//                 message: `${FACTIONS[c.attackerId].name} vs ${FACTIONS[c.defenderId].name}: [${c.attackerRolls.join(',')}] vs [${c.defenderRolls.join(',')}] - ${c.result === 'attacker_wins' ? 'Hyökkääjä voitti' : c.result === 'defender_wins' ? 'Puolustaja voitti' : 'Tasapeli'}`,
//                 timestamp: c.timestamp,
//               }))]
//                 .sort((a, b) => b.timestamp - a.timestamp)
//                 .slice(0, 10)
//                 .map(entry => (
//                   <div key={entry.id} className="text-xs text-stone-400 border-b border-stone-800 pb-1">
//                     <span className="text-stone-500">V{entry.turn}:</span> {entry.message}
//                   </div>
//                 ))}
//             </div>
//           </ScrollArea>
//         </CardContent>
//       </Card>
//
//       {/* Players list */}
//       <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-stone-700/50 backdrop-blur">
//         <CardHeader className="pb-2">
//           <CardTitle className="text-stone-100 text-lg flex items-center gap-2">
//             <Users className="w-5 h-5" />
//             Heimot
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-2">
//             {gameState.players.map(player => {
//               const playerFaction = FACTIONS[player.factionId];
//               const isCurrentPlayer = player.id === gameState.currentPlayerId;
//               const unitCount = gameState.units.filter(u => u.factionId === player.factionId).length;
//               const personality = AI_PERSONALITIES[player.aiPersonality];
//
//               return (
//                 <div
//                   key={player.id}
//                   className={`flex items-center justify-between p-2 rounded-lg transition-all ${
//                     isCurrentPlayer ? 'bg-amber-900/30 ring-1 ring-amber-500/50' : 'bg-stone-800/30'
//                   }`}
//                 >
//                   <div className="flex items-center gap-2">
//                     <span
//                       className="w-4 h-4 rounded-full"
//                       style={{
//                         backgroundColor: playerFaction.color,
//                         boxShadow: isCurrentPlayer ? `0 0 8px ${playerFaction.color}` : 'none',
//                       }}
//                     />
//                     <span className={`text-sm ${isCurrentPlayer ? 'text-amber-100 font-bold' : 'text-stone-300'}`}>
//                       {playerFaction.name}
//                     </span>
//                     {player.isAI && (
//                       <Badge variant="outline" className="text-[10px] border-stone-600 text-stone-400">
//                         {personality.name}
//                       </Badge>
//                     )}
//                   </div>
//                   <div className="flex items-center gap-3 text-xs text-stone-400">
//                     <span>⚔️{unitCount}</span>
//                     <span>⭐{player.victoryPoints}</span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </CardContent>
//       </Card>
//
//       <Button
//         onClick={onReset}
//         variant="outline"
//         className="w-full border-stone-700 text-stone-300 hover:bg-stone-800/50"
//       >
//         <RotateCcw className="w-4 h-4 mr-2" />
//         Aloita alusta
//       </Button>
//     </div>
//   );
// };
