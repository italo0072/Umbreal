'use client'
import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { publicClient } from '@/lib/supabase/client'
import type { Guide } from '@/lib/supabase/database'

export function Guides() {
  const [rows, setRows] = useState<Guide[] | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  async function toggle() {
    if (open && !failed) { setOpen(false); return }
    setOpen(true)
    if (rows) return
    setLoading(true)
    setFailed(false)
    try {
      const { data, error } = await publicClient().from('umbral_guides').select('id, title, detail').order('id')
      if (error) throw error
      setRows(data)
    } catch { setFailed(true) } finally { setLoading(false) }
  }
  return <section className="guide"><button aria-controls="guides" aria-expanded={open} onClick={toggle} disabled={loading}>
    <BookOpen size={18}/>{loading ? 'Cargando guías…' : failed ? 'Reintentar carga de guías' : 'Guías de seguridad'}<ChevronDown size={18}/></button>
    <div id="guides" hidden={!open}>
      {failed && <p role="alert">No se pudieron cargar las guías.</p>}
      {rows?.map(row => <article key={row.id}><h3>{row.title}</h3><p>{row.detail}</p></article>)}
      {rows?.length === 0 && <p>Todavía no hay guías disponibles.</p>}
    </div>
  </section>
}
