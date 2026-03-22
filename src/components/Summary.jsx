import React, { useEffect, useState } from 'react'
import { supabaseCentral } from '../lib/supabase'

const Summary = () => {
  const [report, setReport] = useState([])

  useEffect(() => {
    const fetchReport = async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabaseCentral
        .from('central_deliveries')
        .select('delivery_status, total_amount, restaurant_id')
        .gte('created_at', today)
      setReport(data || [])
    }
    fetchReport()
  }, [])

  const stats = report.reduce((acc, curr) => {
    acc[curr.delivery_status] = (acc[curr.delivery_status] || 0) + 1
    if(curr.delivery_status === 'Entregado') acc.totalMoney += Number(curr.total_amount || 0)
    return acc
  }, { totalMoney: 0 })

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-xl mt-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Resumen de Cierre</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-700 p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Entregados</p>
          <p className="text-3xl font-bold text-green-400">{stats.Entregado || 0}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Incidencias</p>
          <p className="text-3xl font-bold text-red-400">{stats.Incidencia || 0}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Cancelados</p>
          <p className="text-3xl font-bold text-gray-400">{stats.Cancelado || 0}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded text-center">
          <p className="text-gray-400 text-sm">Total Recaudado</p>
          <p className="text-3xl font-bold text-blue-400">${stats.totalMoney.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

export default Summary