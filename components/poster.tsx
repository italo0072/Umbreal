import { Fingerprint } from 'lucide-react'
export function Poster() {
  return <aside className="poster" aria-label="Identidad de Umbral">
    <div className="poster-grid" aria-hidden="true"/>
    <div className="poster-label"><span className="mini-mark">U</span> UMBRAL ID</div>
    <div className="portal-art" aria-hidden="true"><div className="arch outer"/><div className="arch middle"/><div className="arch inner"/><div className="arch door"/></div>
    <div className="poster-caption"><Fingerprint size={32} strokeWidth={1.3}/><p>Tu espacio<br/><em>privado.</em></p></div>
  </aside>
}
