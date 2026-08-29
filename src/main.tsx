import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { acceptContract, advanceVoyageDay, companyValue, createInitialState, currency, ports, type GameState } from './domain';
import { loadState, saveState, SAVE_KEY } from './storage';
import './styles.css';

function App() {
  const [state, setState] = useState<GameState>(() => loadState(localStorage) ?? createInitialState());
  const [tab, setTab] = useState<'market'|'voyage'|'company'>(state.activeVoyage ? 'voyage' : 'market');

  useEffect(() => { saveState(localStorage, state); }, [state]);
  const activeContract = useMemo(() => state.activeVoyage ? state.contracts.find(c => c.id === state.activeVoyage?.contractId) ?? null : null, [state]);

  function start(contractId: string) {
    setState(s => acceptContract(s, contractId));
    setTab('voyage');
  }
  function nextDay() {
    setState(s => {
      const before = Boolean(s.activeVoyage);
      const next = advanceVoyageDay(s);
      if (before && !next.activeVoyage) setTimeout(() => setTab('company'), 0);
      return next;
    });
  }
  function reset() {
    if (!confirm('Lokalen Spielstand wirklich löschen und neu beginnen?')) return;
    localStorage.removeItem(SAVE_KEY);
    setState(createInitialState()); setTab('market');
  }

  return <div className="app-shell">
    <header className="topbar">
      <div><span className="eyebrow">SHIPPING COMPANY</span><h1>Ocean Trader</h1></div>
      <div className="date-pill">{state.campaignDate}</div>
    </header>

    <main>
      <section className="summary-strip" aria-label="Unternehmensübersicht">
        <Summary label="Cash" value={currency(state.cash)} />
        <Summary label="Ruf" value={`${state.reputation}/100`} />
        <Summary label="Wert" value={currency(companyValue(state))} />
      </section>

      {tab === 'market' && <section>
        <div className="section-head"><div><span className="eyebrow">FREIGHT MARKET</span><h2>Hamburg · verfügbare Ladung</h2></div></div>
        <div className="contract-list">
          {state.contracts.filter(c => c.origin === state.vessel.currentPort).map(c => <article className="contract-card" key={c.id}>
            <div className="route"><strong>{ports[c.origin]}</strong><span>→</span><strong>{ports[c.destination]}</strong></div>
            <h3>{c.cargo}</h3>
            <div className="metrics"><span>{c.tonnes.toLocaleString('de-DE')} t</span><span>{c.days} Tage</span><span>Frist {c.deadlineDays} T.</span></div>
            <div className="payout"><span>Fracht</span><strong>{currency(c.payout)}</strong></div>
            <button className="primary" disabled={Boolean(state.activeVoyage)} onClick={() => start(c.id)}>Vertrag annehmen</button>
          </article>)}
          {!state.vessel.currentPort && <div className="empty">Dein Schiff ist unterwegs. Öffne „Reise“.</div>}
          {state.vessel.currentPort && state.contracts.filter(c => c.origin === state.vessel.currentPort).length === 0 && <div className="empty">Für diesen Hafen sind im ersten Slice noch keine neuen Verträge generiert.</div>}
        </div>
      </section>}

      {tab === 'voyage' && <section>
        <span className="eyebrow">ACTIVE VOYAGE</span>
        {state.activeVoyage && activeContract ? <article className="voyage-card">
          <div className="route large"><strong>{ports[activeContract.origin]}</strong><span>→</span><strong>{ports[activeContract.destination]}</strong></div>
          <div className="progress-track"><i style={{width:`${Math.round((state.activeVoyage.day/state.activeVoyage.totalDays)*100)}%`}} /></div>
          <div className="voyage-grid"><Summary label="Tag" value={`${state.activeVoyage.day}/${state.activeVoyage.totalDays}`} /><Summary label="Fuel" value={currency(state.activeVoyage.fuelCost)} /><Summary label="Zustand" value={`${state.vessel.condition.toFixed(1)} %`} /></div>
          {state.activeVoyage.events.length > 0 && <div className="event-box">{state.activeVoyage.events.slice(-1).map(e => <div key={e.day}><strong>{e.title}</strong><span>{e.effect}</span></div>)}</div>}
          <button className="primary big" onClick={nextDay}>Nächsten Tag simulieren</button>
        </article> : <div className="empty">Keine aktive Reise. Wähle zuerst einen Vertrag.</div>}
      </section>}

      {tab === 'company' && <section>
        <span className="eyebrow">COMPANY</span><h2>Northstar Shipping</h2>
        <article className="ship-card"><div><span className="label">Aktives Schiff</span><h3>{state.vessel.name}</h3><p>{state.vessel.className} · {state.vessel.capacityTonnes.toLocaleString('de-DE')} t</p></div><div className="ship-stats"><span>{state.vessel.currentPort ? ports[state.vessel.currentPort] : 'Auf See'}</span><span>{state.vessel.condition.toFixed(1)} % Zustand</span><span>{Math.round(state.vessel.fuelTonnes)} t Fuel</span></div></article>
        <h3 className="log-title">Letzte Buchungen</h3><div className="log">{state.transactionLog.slice(0,6).map((l,i)=><div key={i}>{l}</div>)}</div>
        <button className="secondary danger" onClick={reset}>Spielstand zurücksetzen</button>
      </section>}
    </main>

    <footer className="legal-footer" aria-label="Rechtliche Informationen"><a href="/impressum.html">Impressum</a><span>·</span><a href="/datenschutz.html">Datenschutz</a></footer>
    <nav className="bottom-nav" aria-label="Hauptnavigation">
      <Nav active={tab==='market'} onClick={()=>setTab('market')} icon="◫" label="Markt" />
      <Nav active={tab==='voyage'} onClick={()=>setTab('voyage')} icon="→" label="Reise" badge={Boolean(state.activeVoyage)} />
      <Nav active={tab==='company'} onClick={()=>setTab('company')} icon="≋" label="Firma" />
    </nav>
  </div>;
}

function Summary({label,value}:{label:string,value:string}) { return <div className="summary"><span>{label}</span><strong>{value}</strong></div>; }
function Nav({active,onClick,icon,label,badge}:{active:boolean,onClick:()=>void,icon:string,label:string,badge?:boolean}) { return <button className={active?'nav active':'nav'} onClick={onClick}><span className="nav-icon">{icon}{badge&&<i />}</span><span>{label}</span></button>; }

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
