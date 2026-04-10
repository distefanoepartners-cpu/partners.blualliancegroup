'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface Affiliato {
  id: string
  codice: string
  ragione_sociale: string
  referente_nome?: string
  referente_cognome?: string
  email: string
  tipo_affiliato: string
  commissione_percentuale: number
  attivo: boolean
  created_at: string
}

interface Commissione {
  codice: string
  ragione_sociale: string
  commissione_percentuale: number
  mese: string
  n_prenotazioni: number
  fatturato_generato: number
  commissione_dovuta: number
}

const MATERIALI = [
  { nome: 'Brochure Tour Stagione 2026 (IT)', icon: '📄', link: 'https://catalogo.blualliancegroup.com' },
  { nome: 'Brochure Tour Stagione 2026 (EN)', icon: '📄', link: 'https://catalogo.blualliancegroup.com' },
  { nome: 'QR Code Affiliato', icon: '🔲', link: '#qr' },
  { nome: 'Guida Concierge — Esperienze 2026', icon: '📋', link: '#guida' },
]

export default function PortalePage() {
  const [codice, setCodice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [affiliato, setAffiliato] = useState<Affiliato | null>(null)
  const [commissioni, setCommissioni] = useState<Commissione[]>([])
  const [copiato, setCopiato] = useState(false)
  const [meseSelezionato, setMeseSelezionato] = useState(format(new Date(), 'yyyy-MM'))

  // Controlla sessione salvata
  useEffect(() => {
    const saved = sessionStorage.getItem('ba_partner_codice')
    if (saved) handleLogin(saved, true)
  }, [])

  // Carica commissioni quando cambia il mese
  useEffect(() => {
    if (affiliato) loadCommissioni(affiliato.codice)
  }, [meseSelezionato, affiliato?.codice])

  async function handleLogin(inputCodice?: string, silent = false) {
    const cod = (inputCodice || codice).toUpperCase().trim()
    if (!cod) { setError('Inserisci il tuo codice affiliato'); return }

    if (!silent) setLoading(true)
    setError('')

    try {
      const { data, error: err } = await supabase
        .from('affiliati')
        .select('*')
        .eq('codice', cod)
        .eq('attivo', true)
        .single()

      if (err || !data) {
        setError('Codice non riconosciuto o affiliazione non attiva. Contatta info@blualliancegroup.com')
        sessionStorage.removeItem('ba_partner_codice')
        return
      }

      sessionStorage.setItem('ba_partner_codice', cod)
      setAffiliato(data)
      await loadCommissioni(cod)
    } catch {
      setError('Errore di connessione. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCommissioni(cod: string) {
    const { data } = await supabase
      .from('v_commissioni_affiliati')
      .select('*')
      .eq('codice', cod)

    const filtered = (data || []).filter(c => {
      const d = new Date(c.mese)
      const [y, m] = meseSelezionato.split('-').map(Number)
      return d.getFullYear() === y && d.getMonth() + 1 === m
    })
    setCommissioni(filtered)
  }

  function handleLogout() {
    sessionStorage.removeItem('ba_partner_codice')
    setAffiliato(null)
    setCodice('')
    setCommissioni([])
  }

  function copiaLink() {
    const link = `https://blualliancegroup.com/?ref=${affiliato?.codice}`
    navigator.clipboard.writeText(link)
    setCopiato(true)
    setTimeout(() => setCopiato(false), 2500)
  }

  const totFatturato = commissioni.reduce((s, c) => s + Number(c.fatturato_generato), 0)
  const totCommissione = commissioni.reduce((s, c) => s + Number(c.commissione_dovuta), 0)

  // ── LOGIN ─────────────────────────────────────────────────
  if (!affiliato) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0A2F5C 0%, #1565C0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: '#0A2F5C', borderRadius: '16px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>⚓</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0A2F5C', margin: '0 0 6px' }}>Portale Partner</h1>
            <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>Blu Alliance — Area Affiliati</p>
          </div>

          {/* Form */}
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0A2F5C', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Il tuo Codice Affiliato
            </label>
            <input
              type="text"
              value={codice}
              onChange={e => setCodice(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="BLU-0001"
              maxLength={8}
              style={{
                width: '100%', padding: '14px 16px', border: '2px solid #E2E8F0',
                borderRadius: '12px', fontSize: '20px', fontWeight: '700', fontFamily: 'monospace',
                textAlign: 'center', letterSpacing: '3px', color: '#0A2F5C',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#00BCD4'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#C53030' }}>
              {error}
            </div>
          )}

          <button
            onClick={() => handleLogin()}
            disabled={loading}
            style={{
              width: '100%', padding: '16px', background: '#0A2F5C', color: 'white',
              border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              marginTop: '8px', transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#1565C0' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = '#0A2F5C' }}
          >
            {loading ? 'Accesso in corso...' : 'Accedi alla tua area →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#A0AEC0', marginTop: '24px', lineHeight: '1.5' }}>
            Non hai ancora un codice?<br />
            <a href="https://blualliancegroup.com/partner" style={{ color: '#1565C0', textDecoration: 'none' }}>Scopri il Programma Affiliati</a>
            {' '}·{' '}
            <a href="mailto:info@blualliancegroup.com" style={{ color: '#1565C0', textDecoration: 'none' }}>Contattaci</a>
          </p>
        </div>
      </div>
    )
  }

  // ── DASHBOARD ─────────────────────────────────────────────
  const link = `https://blualliancegroup.com/?ref=${affiliato.codice}`

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F8' }}>

      {/* HEADER */}
      <header style={{ background: '#0A2F5C', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>⚓</span>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', lineHeight: '1.2' }}>Blu Alliance</div>
              <div style={{ color: '#00BCD4', fontSize: '11px' }}>Portale Partner</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
                {affiliato.referente_nome} {affiliato.referente_cognome}
              </div>
              <div style={{ color: '#CBD5E0', fontSize: '11px' }}>{affiliato.ragione_sociale}</div>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>

        {/* BENVENUTO */}
        <div style={{ background: 'linear-gradient(135deg, #0A2F5C, #1565C0)', borderRadius: '20px', padding: '28px 32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(0,188,212,0.15)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ color: '#00BCD4', fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Benvenuto/a
            </div>
            <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' }}>
              {affiliato.ragione_sociale}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', margin: '0 0 20px' }}>
              Partner attivo dal {format(new Date(affiliato.created_at), 'MMMM yyyy', { locale: it })}
            </p>

            {/* Codice + Link */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>Il tuo codice</div>
                  <div style={{ color: '#F5A623', fontSize: '22px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '2px' }}>{affiliato.codice}</div>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px', flex: 1, minWidth: '220px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Il tuo link tracciato</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ color: 'white', fontSize: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</code>
                  <button
                    onClick={copiaLink}
                    style={{ background: copiato ? '#48BB78' : '#F5A623', border: 'none', borderRadius: '8px', padding: '6px 14px', color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
                  >
                    {copiato ? '✅ Copiato' : '📋 Copia'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COME USARE IL LINK */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#0A2F5C', marginBottom: '12px' }}>💡 Come usare il tuo codice</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { icon: '🔗', titolo: 'Invia il link', testo: 'Manda il link tracciato ai tuoi ospiti via WhatsApp o email' },
              { icon: '🔲', titolo: 'QR Code', testo: 'Stampa il QR nella hall — gli ospiti scansionano e prenotano' },
              { icon: '💬', titolo: 'Codice verbale', testo: `Comunica il codice ${affiliato.codice} all\'ospite per inserirlo nel form` },
            ].map(item => (
              <div key={item.titolo} style={{ background: '#F7FAFC', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#2D3748', marginBottom: '4px' }}>{item.titolo}</div>
                <div style={{ fontSize: '12px', color: '#718096', lineHeight: '1.5' }}>{item.testo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMISSIONI */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A2F5C' }}>💰 Le tue Commissioni</div>
            <input
              type="month"
              value={meseSelezionato}
              onChange={e => setMeseSelezionato(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '13px', color: '#2D3748', outline: 'none' }}
            />
          </div>

          {commissioni.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', background: '#F7FAFC', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
              <div style={{ color: '#4A5568', fontSize: '14px', fontWeight: '500' }}>Nessuna commissione per questo mese</div>
              <div style={{ color: '#A0AEC0', fontSize: '12px', marginTop: '4px' }}>Le commissioni appaiono quando i tuoi ospiti completano una prenotazione</div>
            </div>
          ) : (
            <>
              {/* Stats mese */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { label: 'Prenotazioni', val: commissioni.reduce((s, c) => s + Number(c.n_prenotazioni), 0), color: '#1565C0', bg: '#EBF4FF' },
                  { label: 'Fatturato generato', val: `€${totFatturato.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, color: '#2D6A4F', bg: '#D8F3DC' },
                  { label: 'Commissione maturata', val: `€${totCommissione.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`, color: '#C05621', bg: '#FFECD2' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: stat.bg, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: stat.color }}>{stat.val}</div>
                    <div style={{ fontSize: '11px', color: '#718096', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabella */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#0A2F5C' }}>
                      {['Mese', 'Prenotazioni', 'Fatturato', 'Commissione %', 'Da Ricevere'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', color: 'white', fontWeight: '600', textAlign: h === 'Mese' ? 'left' : 'center' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {commissioni.map((c, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#F7FAFC' }}>
                        <td style={{ padding: '10px 14px', fontWeight: '500', color: '#2D3748' }}>
                          {format(new Date(c.mese), 'MMMM yyyy', { locale: it })}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600' }}>{c.n_prenotazioni}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>€{Number(c.fatturato_generato).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{ background: '#EBF4FF', color: '#1565C0', padding: '2px 10px', borderRadius: '20px', fontWeight: '600', fontSize: '12px' }}>
                            {c.commissione_percentuale}%
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#C05621' }}>
                          €{Number(c.commissione_dovuta).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background: '#FFFBF0', border: '1px solid #F6D860', borderRadius: '10px', padding: '12px 16px', marginTop: '12px', fontSize: '12px', color: '#744210' }}>
                💳 Le commissioni vengono accreditate entro il <strong>15 del mese successivo</strong> via bonifico bancario, unitamente al rendiconto dettagliato.
              </div>
            </>
          )}
        </div>

        {/* MATERIALI */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0A2F5C', marginBottom: '16px' }}>📁 Materiali Promozionali</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {MATERIALI.map(mat => (
              <a
                key={mat.nome}
                href={mat.link}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#F7FAFC', borderRadius: '12px', border: '1.5px solid #E2E8F0', textDecoration: 'none', transition: 'border-color 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#00BCD4')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
              >
                <span style={{ fontSize: '24px' }}>{mat.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#2D3748', lineHeight: '1.3' }}>{mat.nome}</div>
                  <div style={{ fontSize: '11px', color: '#1565C0', marginTop: '2px' }}>Scarica →</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SUPPORTO */}
        <div style={{ background: '#0A2F5C', borderRadius: '16px', padding: '24px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>Hai bisogno di supporto?</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>Il nostro team è disponibile per qualsiasi necessità</div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href="mailto:info@blualliancegroup.com"
              style={{ background: '#00BCD4', color: 'white', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>
              📧 Email
            </a>
            <a href="https://blualliancegroup.com"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', border: '1px solid rgba(255,255,255,0.2)' }}>
              🌐 Sito
            </a>
          </div>
        </div>

      </main>

      <footer style={{ textAlign: 'center', padding: '24px', fontSize: '12px', color: '#A0AEC0' }}>
        © 2026 Consorzio Blu Alliance · Porto di Salerno · info@blualliancegroup.com
      </footer>
    </div>
  )
}
