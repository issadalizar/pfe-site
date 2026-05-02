import React, { useState, useMemo } from "react";
import {
  FaTrophy,
  FaMedal,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaBoxOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const RANK_BADGES = {
  1: { color: "#f59e0b", bg: "#fef3c7", icon: <FaTrophy /> },
  2: { color: "#94a3b8", bg: "#f1f5f9", icon: <FaMedal /> },
  3: { color: "#b45309", bg: "#fef3c7", icon: <FaMedal /> },
};

function MiniBars({ values, color = "#4361ee" }) {
  const max = Math.max(...values, 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "2px",
        height: "32px",
        minWidth: "120px",
      }}
      title={values
        .map((v, i) => `${MONTH_LABELS[i]}: ${v}`)
        .join("  •  ")}
    >
      {values.map((v, i) => {
        const h = v === 0 ? 2 : Math.max(4, (v / max) * 100);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              backgroundColor: v === 0 ? "#e2e8f0" : color,
              borderRadius: "2px 2px 0 0",
              minWidth: "6px",
              transition: "all 0.2s",
            }}
          />
        );
      })}
    </div>
  );
}

export default function StockEvolutionTable({ data = [], year }) {
  const [sortBy, setSortBy] = useState("totalSold");
  const [sortDir, setSortDir] = useState("desc");

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      if (va === vb) return 0;
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return copy;
  }, [data, sortBy, sortDir]);

  const setSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === "desc" ? "asc" : "desc");
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const sortIndicator = (col) =>
    sortBy === col ? (sortDir === "desc" ? " ▼" : " ▲") : "";

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <FaBoxOpen size={36} className="text-muted mb-3" />
        <p className="text-muted mb-0">
          Aucun mouvement de stock enregistré pour {year}
        </p>
      </div>
    );
  }

  const totalUnits = data.reduce((s, p) => s + (p.totalSold || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        className="d-flex flex-wrap gap-3 px-3 py-2 rounded-3"
        style={{ backgroundColor: "#f8fafc" }}
      >
        <div>
          <span className="text-muted small">Produits classés</span>
          <div className="fw-bold" style={{ color: "#1a1a2e" }}>
            {data.length}
          </div>
        </div>
        <div className="border-start ps-3">
          <span className="text-muted small">Unités sorties (total)</span>
          <div className="fw-bold" style={{ color: "#4361ee" }}>
            {totalUnits.toLocaleString()}
          </div>
        </div>
        <div className="border-start ps-3">
          <span className="text-muted small">Année</span>
          <div className="fw-bold" style={{ color: "#1a1a2e" }}>
            {year}
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  width: "60px",
                  textTransform: "uppercase",
                }}
              >
                Rang
              </th>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Produit
              </th>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => setSort("currentStock")}
              >
                Stock actuel{sortIndicator("currentStock")}
              </th>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
                onClick={() => setSort("totalSold")}
              >
                Évolution mensuelle{sortIndicator("totalSold")}
              </th>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textAlign: "right",
                  cursor: "pointer",
                }}
                onClick={() => setSort("totalSold")}
              >
                Total sorti
              </th>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textAlign: "right",
                  cursor: "pointer",
                }}
                onClick={() => setSort("avgMonthly")}
              >
                Moyenne / mois{sortIndicator("avgMonthly")}
              </th>
              <th
                style={{
                  fontSize: "0.72rem",
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={() => setSort("evolution")}
              >
                MoM{sortIndicator("evolution")}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => {
              const rank = idx + 1;
              const badge = RANK_BADGES[rank];
              const lowStock =
                typeof p.currentStock === "number" && p.currentStock <= 5;
              const evo = p.evolution;
              const evoColor =
                evo > 0 ? "#16a34a" : evo < 0 ? "#dc2626" : "#64748b";

              return (
                <tr key={p.productId || p.productName || idx}>
                  <td>
                    {badge ? (
                      <span
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: badge.bg,
                          color: badge.color,
                          fontSize: "14px",
                        }}
                      >
                        {badge.icon}
                      </span>
                    ) : (
                      <span
                        className="text-muted fw-semibold"
                        style={{ fontSize: "0.9rem" }}
                      >
                        #{rank}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#1a1a2e",
                      maxWidth: "240px",
                    }}
                  >
                    <div
                      className="text-truncate"
                      title={p.productName}
                      style={{ maxWidth: "240px" }}
                    >
                      {p.productName}
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {p.currentStock === null ||
                    p.currentStock === undefined ? (
                      <span className="text-muted small">—</span>
                    ) : (
                      <span
                        className="badge px-2 py-1"
                        style={{
                          backgroundColor: lowStock ? "#fee2e2" : "#ecfdf5",
                          color: lowStock ? "#dc2626" : "#059669",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                        }}
                      >
                        {lowStock && (
                          <FaExclamationTriangle
                            size={9}
                            className="me-1"
                          />
                        )}
                        {p.currentStock}
                      </span>
                    )}
                  </td>
                  <td>
                    <MiniBars
                      values={p.monthlySold}
                      color={rank <= 3 ? "#f59e0b" : "#4361ee"}
                    />
                  </td>
                  <td
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      textAlign: "right",
                      color: "#1a1a2e",
                    }}
                  >
                    {p.totalSold.toLocaleString()}
                  </td>
                  <td
                    style={{
                      fontSize: "0.82rem",
                      textAlign: "right",
                      color: "#64748b",
                    }}
                  >
                    {p.avgMonthly.toFixed(1)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className="badge px-2 py-1 d-inline-flex align-items-center"
                      style={{
                        backgroundColor:
                          evo > 0
                            ? "#dcfce7"
                            : evo < 0
                              ? "#fee2e2"
                              : "#f1f5f9",
                        color: evoColor,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {evo > 0 && <FaArrowUp size={9} className="me-1" />}
                      {evo < 0 && <FaArrowDown size={9} className="me-1" />}
                      {evo === 0 && <FaMinus size={9} className="me-1" />}
                      {evo > 0 ? "+" : ""}
                      {evo.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-wrap gap-3 px-3 py-2 small text-muted border-top">
        <div className="d-flex align-items-center gap-1">
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "#f59e0b",
              borderRadius: "2px",
            }}
          />
          <span>Top 3</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "#4361ee",
              borderRadius: "2px",
            }}
          />
          <span>Autres produits</span>
        </div>
        <div className="d-flex align-items-center gap-1 ms-auto">
          <FaExclamationTriangle size={11} style={{ color: "#dc2626" }} />
          <span>Stock ≤ 5 unités</span>
        </div>
      </div>
    </div>
  );
}
