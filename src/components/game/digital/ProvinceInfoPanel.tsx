/**
 * ProvinceInfoPanel.tsx — Provinssin tietopaneeli
 *
 * Näyttää valitun provinssin yksityiskohtaiset tiedot:
 * omistaja, maasto, verot, miesvoima, puolustus, linnoitus,
 * kauppatavara, Silkkitie, levottomuus, armeijat ja toimintopainikkeet.
 */
import { Province, Army, FactionId, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  Sword, 
  Shield, 
  Users, 
  Coins,
  Home,
  Castle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface ProvinceInfoPanelProps {
  province: Province;
  armies: Army[];
  playerFaction: FactionId;
  onRecruitArmy: () => void;
  canRecruit: boolean;
  onBuildFort?: () => void;
  canBuildFort?: boolean;
}

export const ProvinceInfoPanel = ({
  province,
  armies,
  playerFaction,
  onRecruitArmy,
  canRecruit,
}: ProvinceInfoPanelProps) => {
  const terrainInfo = PROVINCE_TERRAIN_INFO[province.terrain];
  const tradeGood = province.tradeGood ? TRADE_GOODS_INFO[province.tradeGood] : null;
  const owner = province.ownerId ? FACTION_DATA_1206[province.ownerId] : null;
  const isPlayerOwned = province.ownerId === playerFaction;
  const totalDefenseBonus = terrainInfo.defenseBonus + province.fortLevel * 3;
  
  const playerArmies = armies.filter(a => a.ownerId === playerFaction);
  const enemyArmies = armies.filter(a => a.ownerId !== playerFaction);
  
  return (
    <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-stone-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
          <span className="text-2xl">{terrainInfo.emoji}</span>
          {province.name}
          {province.isCapital && <Badge className="bg-amber-600">Pääkaupunki</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner */}
        <div className="flex items-center justify-between">
          <span className="text-stone-400 text-sm">Omistaja</span>
          <div className="flex items-center gap-2">
            {owner ? (
              <>
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: owner.color }}
                />
                <span className="text-amber-100">{owner.name}</span>
              </>
            ) : (
              <span className="text-stone-500 italic">Neutraali</span>
            )}
          </div>
        </div>
        
        {/* Terrain */}
        <div className="flex items-center justify-between">
          <span className="text-stone-400 text-sm">Maasto</span>
          <span className="text-stone-200">{terrainInfo.name}</span>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-700">
          <div className="bg-stone-800/50 rounded-lg p-3 text-center">
            <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-amber-100">{province.baseTax}</div>
            <div className="text-xs text-stone-400">Verot</div>
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-100">{province.baseManpower}</div>
            <div className="text-xs text-stone-400">Miesvoima</div>
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3 text-center">
            <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-100">+{totalDefenseBonus}</div>
            <div className="text-xs text-stone-400">Puolustus</div>
            {province.fortLevel > 0 && (
              <div className="text-[10px] text-amber-300/80 mt-1">
                maasto {terrainInfo.defenseBonus} + linnoitus {province.fortLevel * 3}
              </div>
            )}
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3 text-center">
            <Home className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-100">{province.supply}</div>
            <div className="text-xs text-stone-400">Tarjonta</div>
          </div>
        </div>
        
        {/* Fort level */}
        {province.fortLevel > 0 && (
          <div className="flex items-center gap-2 bg-stone-800/50 rounded-lg p-3">
            <Castle className="w-5 h-5 text-amber-400" />
            <span className="text-stone-300">Linnoitus</span>
            <span className="text-amber-100 font-bold ml-auto">Taso {province.fortLevel} (+{province.fortLevel * 3} puolustus)</span>
          </div>
        )}
        
        {/* Trade good */}
        {tradeGood && (
          <div className="flex items-center gap-2 bg-stone-800/50 rounded-lg p-3">
            <span className="text-lg">{tradeGood.emoji}</span>
            <span className="text-stone-300">{tradeGood.name}</span>
            <span className="text-xs text-stone-400 ml-auto">{tradeGood.effect}</span>
          </div>
        )}
        
        {/* Silk Road */}
        {province.hasSilkRoad && (
          <div className="flex items-center gap-2 bg-amber-900/30 rounded-lg p-3 border border-amber-700/30">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-amber-200">Silkkitien varrella</span>
              <span className="text-xs text-amber-300/70 ml-2">+2 💰/vuoro</span>
            </div>
          </div>
        )}
        
        {/* Unrest */}
        {province.unrest > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Levottomuus
              </span>
              <span className="text-red-300">{province.unrest}%</span>
            </div>
            <Progress value={province.unrest} className="h-2 [&>div]:bg-red-500" />
          </div>
        )}
        
        {/* Armies */}
        {armies.length > 0 && (
          <div className="pt-2 border-t border-stone-700">
            <h4 className="text-sm font-semibold text-stone-400 mb-2 flex items-center gap-2">
              <Sword className="w-4 h-4" />
              Armeijat
            </h4>
            <div className="space-y-2">
              {armies.map(army => {
                const armyFaction = FACTION_DATA_1206[army.ownerId];
                const isPlayer = army.ownerId === playerFaction;
                
                return (
                  <div 
                    key={army.id}
                    className={`rounded-lg p-3 ${
                      isPlayer ? 'bg-green-900/30 border border-green-700/30' : 'bg-red-900/30 border border-red-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: armyFaction.color }}
                        />
                        <span className={isPlayer ? 'text-green-200' : 'text-red-200'}>
                          {armyFaction.name}
                        </span>
                      </div>
                      <Badge variant="outline" className={isPlayer ? 'border-green-500 text-green-200' : 'border-red-500 text-red-200'}>
                        {army.cavalry + army.infantry} yksikköä
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-stone-400">
                      <div>🐴 {army.cavalry}</div>
                      <div>⚔️ {army.infantry}</div>
                      <div>🔥 {army.siege}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-stone-400">Moraali:</span>
                      <Progress value={army.morale} className="h-1 flex-1" />
                      <span className="text-stone-300">{army.morale}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Actions (only for player provinces) */}
        {isPlayerOwned && (
          <div className="pt-2 border-t border-stone-700 space-y-2">
            <Button
              onClick={onRecruitArmy}
              disabled={!canRecruit}
              variant="outline"
              className="w-full border-green-600 text-green-200 hover:bg-green-900/30"
            >
              <Sword className="w-4 h-4 mr-2" />
              Rekrytoi armeija (20 💰, 5 👥)
            </Button>
            {!canRecruit && isPlayerOwned && (
              <p className="text-xs text-amber-300/60 text-center">
                ⚠️ Rekrytointi vaatii pääkaupungin tai leirin (⛺)
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
