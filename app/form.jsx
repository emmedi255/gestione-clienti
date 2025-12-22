'use client'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function Dashboard() {
  const [company, setCompany] = useState('')
  const [vat, setVat] = useState('')
  const [address, setAddress] = useState('')

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('customer_data').insert({
      user_id: user.id,
      company,
      vat_number: vat,
      address
    })
  }

  return (
    <>
      <input placeholder="Azienda" onChange={e=>setCompany(e.target.value)} />
      <input placeholder="P.IVA" onChange={e=>setVat(e.target.value)} />
      <input placeholder="Indirizzo" onChange={e=>setAddress(e.target.value)} />
      <button onClick={save}>Salva</button>
    </>
  )
}
