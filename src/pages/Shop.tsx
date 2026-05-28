import { Link, useLocation } from 'react-router-dom';

const PRODUCTS = {
  strategiapeliopas: {
    title: 'Strategiapeliopas',
    description: 'Oppaassa on hyödyllisiä taktiikoita, karttavinkkejä ja pelin parhaat avaukset.',
    price: '9,90 €',
    actionText: 'Siirry ostoskoriin',
    actionUrl: 'https://example.com/shop/strategiapeliopas',
  },
  fanituote: {
    title: 'Fanituotepaketti',
    description: 'Tilaa pelimuki ja näyttävä juliste. Täydellinen lahja strategiapelaajalle.',
    price: '24,90 €',
    actionText: 'Osta fanituote',
    actionUrl: 'https://example.com/shop/fanituotepaketti',
  },
  karttakirja: {
    title: 'Silkkitie-karttakirja',
    description: 'Laadukas karttakirja Silkkitien reiteistä, kaupunkien sijainneista ja historiahetkistä.',
    price: '14,90 €',
    actionText: 'Katso lisätietoja',
    actionUrl: 'https://example.com/shop/karttakirja',
  },
  'premium-paketti': {
    title: 'Premium-lisäpaketti',
    description: 'Avaa bonusmateriaaleja, uusia skenaarioita ja pelin premium-ominaisuuksia.',
    price: '12,90 €',
    actionText: 'Tilaa premium',
    actionUrl: 'https://example.com/shop/premium-paketti',
  },
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Shop = () => {
  const query = useQuery();
  const productId = query.get('product');
  const product = productId ? PRODUCTS[productId] : null;

  return (
    <div className="min-h-[100vh] bg-slate-950 text-slate-100 py-16 px-4 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-black/40">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Ostosivu</h1>
          <p className="mt-2 text-slate-400">Tässä näet mainoksen kautta valitsemasi tuotteen ja löydät ostotiedot.</p>
        </div>

        {product ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-amber-600/30 bg-amber-950/40 p-6">
              <h2 className="text-3xl font-semibold text-amber-200">{product.title}</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{product.description}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-200">Hinta: {product.price}</span>
                <a
                  href={product.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  {product.actionText}
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
              <p className="text-slate-400">Etkö löytänyt sopivaa tuotetta? <Link to="/shop" className="font-semibold text-amber-300 hover:text-amber-200">Näytä kaikki tuotteet</Link>.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(PRODUCTS).map(([id, item]) => (
              <Link
                key={id}
                to={`/shop?product=${id}`}
                className="group rounded-3xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-amber-500/50 hover:bg-slate-900"
              >
                <h2 className="text-2xl font-semibold text-white group-hover:text-amber-200">{item.title}</h2>
                <p className="mt-3 text-slate-400 leading-relaxed">{item.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>{item.price}</span>
                  <span className="font-semibold text-amber-300">Valitse</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
