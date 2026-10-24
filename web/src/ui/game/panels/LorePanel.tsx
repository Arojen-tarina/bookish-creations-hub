import type { Province } from '../../../game/model/models';
import { cityLoreFor } from '../../../game/data/cityLore';
import { GameButton } from '../../components/GameButton';

/**
 * Read-only lore view for one city. It dispatches no game actions and does not
 * change ownership or game state, so it is safe to open at any time.
 */
export function LorePanel({ province, onDismiss }: { province: Province; onDismiss: () => void }) {
  const lore = cityLoreFor(province);
  return <div role="presentation" onClick={onDismiss} style={{ position: 'fixed', inset: 0, background: '#000a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 16 }}>
    <section role="dialog" aria-modal="true" aria-labelledby="lore-title" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 520, width: '100%', maxHeight: '80vh', overflowY: 'auto', background: '#1b1612', color: '#f4ead5', border: '1px solid #a8772a', borderRadius: 12, padding: 18 }}>
      <h2 id="lore-title" style={{ margin: 0 }}>{lore.title}</h2>
      {lore.historicalName && <p style={{ margin: '4px 0 0', fontStyle: 'italic', opacity: 0.8 }}>{lore.historicalName}</p>}
      <p style={{ margin: '4px 0 10px', opacity: 0.8 }}>{lore.area}</p>
      <p>{lore.summary}</p>
      {lore.sections.map((item) => <section className="game-section" key={item.heading}><h3>{item.heading}</h3><p>{item.body}</p></section>)}
      {lore.sources.length > 0 && <section className="game-section"><h3>Lähteet</h3><ul>{lore.sources.map((source) => <li key={source}>{source}</li>)}</ul></section>}
      <p style={{ fontSize: '0.85em', opacity: 0.7 }}>Tarinatieto. Ei muuta kaupungin omistajuutta tai pelitilaa.</p>
      <GameButton onClick={onDismiss}>Sulje</GameButton>
    </section>
  </div>;
}
