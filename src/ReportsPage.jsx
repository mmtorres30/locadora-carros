import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { Loader2, Download, BarChart3, Calendar, Car } from "lucide-react";
import * as XLSX from "xlsx";

function diffDias(dataIni, dataFim) {
  if (!dataIni || !dataFim) return null;
  const d1 = new Date(dataIni), d2 = new Date(dataFim);
  const dias = Math.round((d2 - d1) / 86400000);
  return Math.max(1, dias);
}

function kmNum(v) {
  if (!v) return null;
  const n = parseFloat(String(v).replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function kmRodado(r) {
  if (r.status !== "fechada") return 0;
  const ini = kmNum(r.retirada?.km), fim = kmNum(r.devolucao?.km);
  if (ini == null || fim == null || fim < ini) return 0;
  return fim - ini;
}

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataIni, setDataIni] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [placaBusca, setPlacaBusca] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("locacoes")
        .select("id,status,motorista,veiculo,retirada,devolucao,created_at")
        .order("created_at", { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const filtradas = useMemo(() => {
    return rows.filter((r) => {
      if (dataIni && (!r.retirada?.data || r.retirada.data < dataIni)) return false;
      if (dataFim && (!r.retirada?.data || r.retirada.data > dataFim)) return false;
      if (placaBusca && !(r.veiculo?.placa || "").toLowerCase().includes(placaBusca.toLowerCase())) return false;
      return true;
    });
  }, [rows, dataIni, dataFim, placaBusca]);

  const porDia = useMemo(() => {
    const map = new Map();
    filtradas.forEach((r) => {
      const dia = r.retirada?.data || "sem data";
      if (!map.has(dia)) map.set(dia, { dia, retiradas: 0, devolucoes: 0, kmRodado: 0 });
      map.get(dia).retiradas += 1;
      if (r.status === "fechada" && r.devolucao?.data) {
        const key = r.devolucao.data;
        if (!map.has(key)) map.set(key, { dia: key, retiradas: 0, devolucoes: 0, kmRodado: 0 });
        map.get(key).devolucoes += 1;
        map.get(key).kmRodado += kmRodado(r);
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.dia < b.dia ? 1 : -1));
  }, [filtradas]);

  const porPlaca = useMemo(() => {
    const map = new Map();
    filtradas.forEach((r) => {
      const placa = r.veiculo?.placa || "sem placa";
      if (!map.has(placa)) map.set(placa, { placa, modelo: r.veiculo?.modelo || "-", total: 0, abertas: 0, fechadas: 0, diasTotal: 0, kmTotal: 0 });
      const e = map.get(placa);
      e.total += 1;
      if (r.status === "aberta") e.abertas += 1;
      else {
        e.fechadas += 1;
        const d = diffDias(r.retirada?.data, r.devolucao?.data);
        if (d) e.diasTotal += d;
        e.kmTotal += kmRodado(r);
      }
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filtradas]);

  function exportarExcel() {
    const wb = XLSX.utils.book_new();
    const wsDia = XLSX.utils.json_to_sheet(porDia.map((d) => ({
      Data: d.dia, Retiradas: d.retiradas, Devoluções: d.devolucoes, "Km rodado": d.kmRodado,
    })));
    XLSX.utils.book_append_sheet(wb, wsDia, "Por dia");

    const wsPlaca = XLSX.utils.json_to_sheet(porPlaca.map((p) => ({
      Placa: p.placa, Modelo: p.modelo, "Total de locações": p.total,
      "Em andamento": p.abertas, Concluídas: p.fechadas, "Dias alugado (total)": p.diasTotal, "Km rodado (total)": p.kmTotal,
    })));
    XLSX.utils.book_append_sheet(wb, wsPlaca, "Por placa");

    const wsDet = XLSX.utils.json_to_sheet(filtradas.map((r) => ({
      Motorista: r.motorista?.nome, Placa: r.veiculo?.placa, Modelo: r.veiculo?.modelo,
      "Data retirada": r.retirada?.data, "Data devolução": r.devolucao?.data || "",
      "Km retirada": r.retirada?.km || "", "Km devolução": r.devolucao?.km || "", "Km rodado": kmRodado(r),
      Status: r.status === "aberta" ? "Em andamento" : "Concluída",
    })));
    XLSX.utils.book_append_sheet(wb, wsDet, "Detalhado");

    XLSX.writeFile(wb, `relatorio-locacoes-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="crs-main">
      <div className="crs-section">
        <div className="crs-section-head"><BarChart3 size={16} /> Filtros</div>
        <div className="crs-section-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div className="crs-field"><label>De</label><input type="date" value={dataIni} onChange={(e) => setDataIni(e.target.value)} /></div>
          <div className="crs-field"><label>Até</label><input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /></div>
          <div className="crs-field"><label>Placa</label><input type="text" placeholder="Buscar placa" value={placaBusca} onChange={(e) => setPlacaBusca(e.target.value)} /></div>
        </div>
      </div>

      {loading ? (
        <div className="crs-empty"><Loader2 className="spin" /> Carregando dados...</div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button className="crs-btn crs-btn-dark" onClick={exportarExcel}><Download size={14} /> Exportar Excel</button>
          </div>

          <div className="crs-section">
            <div className="crs-section-head"><Calendar size={16} /> Relatório por dia</div>
            <div className="crs-section-body" style={{ padding: 0 }}>
              <table className="crs-table">
                <thead><tr><th>Data</th><th>Retiradas</th><th>Devoluções</th><th>Km rodado</th></tr></thead>
                <tbody>
                  {porDia.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 20, color: "#8a8578" }}>Sem dados no período.</td></tr>}
                  {porDia.map((d) => (
                    <tr key={d.dia}><td className="crs-mono">{d.dia}</td><td>{d.retiradas}</td><td>{d.devolucoes}</td><td>{d.kmRodado || "-"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="crs-section">
            <div className="crs-section-head"><Car size={16} /> Relatório por placa</div>
            <div className="crs-section-body" style={{ padding: 0 }}>
              <table className="crs-table">
                <thead><tr><th>Placa</th><th>Modelo</th><th>Total</th><th>Em andamento</th><th>Concluídas</th><th>Dias alugado</th><th>Km rodado</th></tr></thead>
                <tbody>
                  {porPlaca.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#8a8578" }}>Sem dados no período.</td></tr>}
                  {porPlaca.map((p) => (
                    <tr key={p.placa}>
                      <td className="crs-mono">{p.placa}</td><td>{p.modelo}</td><td>{p.total}</td>
                      <td>{p.abertas}</td><td>{p.fechadas}</td><td>{p.diasTotal}</td><td>{p.kmTotal || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
