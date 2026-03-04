// Tulostettavat pelinappulat ja nopat Mongolien Valtakunta -lautapeliin

const factions = [
  { name: "Mongoli-imperiumi", color: "bg-red-700", border: "border-red-900", icon: "🏇", textColor: "text-red-100" },
  { name: "Jin-dynastia", color: "bg-amber-600", border: "border-amber-800", icon: "🏯", textColor: "text-amber-100" },
  { name: "Khwarezmia", color: "bg-green-700", border: "border-green-900", icon: "🕌", textColor: "text-green-100" },
  { name: "Kumaaninliitto", color: "bg-blue-700", border: "border-blue-900", icon: "🐺", textColor: "text-blue-100" },
];

const unitTypes = [
  { name: "Ratsuväki", icon: "🏇", stats: "Liike 3 · Hyökkäys 3 · Puolustus 2" },
  { name: "Jalkaväki", icon: "🛡️", stats: "Liike 1 · Hyökkäys 2 · Puolustus 3" },
  { name: "Khaanin palvelija", icon: "👑", stats: "Liike 2 · Hyökkäys 1 · Puolustus 1 · Erikois +" },
  { name: "Piirityskoneet", icon: "🏗️", stats: "Liike 1 · Hyökkäys 4 · Puolustus 0" },
];

const TokenCircle = ({ faction, unit }: { faction: typeof factions[0]; unit: typeof unitTypes[0] }) => (
  <div className={`w-[25mm] h-[25mm] rounded-full ${faction.color} ${faction.border} border-3 flex flex-col items-center justify-center shadow-md print:break-inside-avoid`}>
    <span className="text-xl leading-none">{unit.icon}</span>
    <span className={`text-[7px] font-bold ${faction.textColor} mt-0.5 leading-none`}>{unit.name}</span>
    <span className={`text-[5px] ${faction.textColor} opacity-80 leading-none mt-0.5`}>{faction.name.slice(0, 8)}</span>
  </div>
);

const ResourceToken = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="w-[20mm] h-[20mm] rounded-lg bg-amber-200 border-2 border-amber-600 flex flex-col items-center justify-center print:break-inside-avoid">
    <span className="text-lg leading-none">{icon}</span>
    <span className="text-[7px] font-bold text-amber-900 mt-0.5">{label}</span>
    <span className="text-[6px] text-amber-700">{value}</span>
  </div>
);

// Custom d6 faces for the game
const diceFaces = [
  { value: "⚔️", label: "Hyökkäys", desc: "+1 hyökkäysbonus" },
  { value: "🛡️", label: "Puolustus", desc: "+1 puolustusbonus" },
  { value: "🏇", label: "Ratsu", desc: "+1 liike ratsuväelle" },
  { value: "💰", label: "Kulta", desc: "+2 kultaa" },
  { value: "📦", label: "Resurssit", desc: "+1 mikä tahansa resurssi" },
  { value: "★", label: "Kriittinen", desc: "Tuplaa vaikutus!" },
];

const DiceFace = ({ face, index }: { face: typeof diceFaces[0]; index: number }) => (
  <div className="w-[22mm] h-[22mm] bg-amber-50 border-2 border-amber-800 rounded-lg flex flex-col items-center justify-center print:break-inside-avoid shadow-sm">
    <span className="text-[8px] text-amber-500 font-mono">{index + 1}</span>
    <span className="text-2xl leading-none">{face.value}</span>
    <span className="text-[7px] font-bold text-amber-900 mt-0.5">{face.label}</span>
    <span className="text-[5px] text-amber-700 text-center px-1">{face.desc}</span>
  </div>
);

export const PrintableTokensAndDice = () => (
  <div className="print:block">
    {/* Page 1: Unit tokens */}
    <div className="w-[210mm] min-h-[297mm] p-6 bg-white print:break-after-page">
      <h2 className="text-xl font-bold text-center text-amber-900 mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
        Pelinappulat — Yksiköt
      </h2>
      <p className="text-xs text-center text-amber-700 mb-4">Leikkaa ympyrät ja liimaa pahville. 4 fraktiota × 4 yksikkötyyppiä.</p>

      {factions.map((faction) => (
        <div key={faction.name} className="mb-6">
          <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1">
            {faction.icon} {faction.name}
          </h3>
          <div className="flex flex-wrap gap-3">
            {/* 3x ratsuväki, 3x jalkaväki, 1x khaanin palvelija, 1x piirityskoneet */}
            {[...Array(3)].map((_, i) => <TokenCircle key={`c${i}`} faction={faction} unit={unitTypes[0]} />)}
            {[...Array(3)].map((_, i) => <TokenCircle key={`i${i}`} faction={faction} unit={unitTypes[1]} />)}
            <TokenCircle faction={faction} unit={unitTypes[2]} />
            <TokenCircle faction={faction} unit={unitTypes[3]} />
          </div>
          {/* Unit stat reference */}
          <div className="mt-2 flex gap-4 text-[8px] text-amber-700">
            {unitTypes.map(u => (
              <span key={u.name}>{u.icon} {u.name}: {u.stats}</span>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Page 2: Resource tokens + Dice */}
    <div className="w-[210mm] min-h-[297mm] p-6 bg-white print:break-after-page">
      <h2 className="text-xl font-bold text-center text-amber-900 mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
        Resurssimerkkit & Noppajärjestelmä
      </h2>
      <p className="text-xs text-center text-amber-700 mb-6">Leikkaa ja liimaa pahville.</p>

      {/* Resource tokens */}
      <h3 className="text-sm font-bold text-amber-800 mb-3">📦 Resurssimerkkit</h3>
      <div className="flex flex-wrap gap-2 mb-8">
        {[...Array(8)].map((_, i) => <ResourceToken key={`h${i}`} icon="🐴" label="Hevoset" value="+1" />)}
        {[...Array(8)].map((_, i) => <ResourceToken key={`g${i}`} icon="💰" label="Kulta" value="+1" />)}
        {[...Array(8)].map((_, i) => <ResourceToken key={`f${i}`} icon="🌾" label="Ruoka" value="+1" />)}
        {[...Array(4)].map((_, i) => <ResourceToken key={`a${i}`} icon="🔨" label="Käsityö" value="+1" />)}
        {[...Array(4)].map((_, i) => <ResourceToken key={`k${i}`} icon="🐑" label="Karja" value="+1" />)}
      </div>

      {/* Dice system */}
      <h3 className="text-sm font-bold text-amber-800 mb-2">🎲 Taistelunoppa (D6)</h3>
      <p className="text-xs text-amber-700 mb-3">
        Mongolien Valtakunta käyttää erikoisnoppaa. Merkitse tavallisen nopan sivut näillä symboleilla, tai käytä alla olevia referenssejä.
      </p>
      <div className="flex flex-wrap gap-3 mb-6">
        {diceFaces.map((face, i) => <DiceFace key={i} face={face} index={i} />)}
      </div>

      {/* Dice reference table */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
        <h4 className="text-xs font-bold text-amber-900 mb-2">🎲 Taistelunopan käyttö</h4>
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr className="bg-amber-200">
              <th className="border border-amber-400 p-1.5 text-left">Noppa</th>
              <th className="border border-amber-400 p-1.5 text-left">Tulos</th>
              <th className="border border-amber-400 p-1.5 text-left">Vaikutus</th>
            </tr>
          </thead>
          <tbody>
            {diceFaces.map((face, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                <td className="border border-amber-300 p-1.5 font-bold text-center">{i + 1} ({face.value})</td>
                <td className="border border-amber-300 p-1.5 font-semibold">{face.label}</td>
                <td className="border border-amber-300 p-1.5">{face.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-[9px] text-amber-800">
          <p className="font-bold mb-1">Taistelusäännöt:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Kumpikin pelaaja heittää 1 nopan per yksikkö (max 3 noppaa)</li>
            <li>⚔️ osuu: vertaa hyökkäysvoimaan — ylittää puolustuksen = osuma</li>
            <li>🛡️ torjuu: torjuu yhden osuman</li>
            <li>🏇 bonusliike: ratsuväki saa lisäliikkeen taistelun jälkeen</li>
            <li>★ kriittinen: tuplaa yhden nopan tulos — paras tulos!</li>
            <li>💰/📦 ovat taistelussa tyhjiä — ei vaikutusta</li>
          </ul>
        </div>
      </div>

      {/* VP markers */}
      <h3 className="text-sm font-bold text-amber-800 mb-2 mt-6">🏆 Voittopistemerkkit</h3>
      <div className="flex flex-wrap gap-2">
        {[1, 1, 1, 2, 2, 3, 3, 5, 5, 10].map((vp, i) => (
          <div key={i} className="w-[18mm] h-[18mm] rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-700 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-amber-900">{vp}</span>
            <span className="text-[6px] text-amber-800">VP</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
