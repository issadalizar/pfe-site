import React from "react";
import { FaArrowUp, FaArrowDown, FaMinus, FaChartPie } from "react-icons/fa";
import MonthComparisonDonut from "./MonthlyComparisonDonut";

export default function MonthComparisonTable({
  data,
  formatPrice,
  showDonut = true,
}) {
  // Calculer l'évolution pour chaque mois par rapport au mois précédent
  const monthlyComparisons = data.map((item, index) => {
    if (index === 0) {
      return {
        month: item.month,
        revenue: item.revenue,
        evolution: null,
        trend: null,
      };
    }
    const previousRevenue = data[index - 1].revenue;
    const currentRevenue = item.revenue;
    const evolution =
      previousRevenue === 0
        ? 0
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    const trend = evolution > 0 ? "up" : evolution < 0 ? "down" : "stable";
    return { month: item.month, revenue: item.revenue, evolution, trend };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── Tableau comparatif ── */}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              <th
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                Mois
              </th>
              <th
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                Chiffre d'affaires
              </th>
              <th
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                Évolution
              </th>
              <th
                style={{
                  fontSize: "0.75rem",
                  color: "#64748b",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                Tendance
              </th>
            </tr>
          </thead>
          <tbody>
            {monthlyComparisons.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  {item.month}
                </td>
                <td
                  style={{
                    fontSize: "0.85rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: "#4361ee",
                  }}
                >
                  {formatPrice(item.revenue)} DT
                </td>
                <td
                  style={{
                    fontSize: "0.85rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color:
                      item.evolution > 0
                        ? "#16a34a"
                        : item.evolution < 0
                          ? "#dc2626"
                          : "#64748b",
                  }}
                >
                  {item.evolution !== null ? (
                    <>
                      {item.evolution > 0 ? "+" : ""}
                      {item.evolution.toFixed(2)}%
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {item.trend === "up" && (
                    <span className="badge bg-success bg-opacity-10 text-success px-2 py-1">
                      <FaArrowUp className="me-1" size={10} />
                      Croissance
                    </span>
                  )}
                  {item.trend === "down" && (
                    <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1">
                      <FaArrowDown className="me-1" size={10} />
                      Baisse
                    </span>
                  )}
                  {item.trend === "stable" && item.evolution !== null && (
                    <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">
                      <FaMinus className="me-1" size={10} />
                      Stable
                    </span>
                  )}
                  {item.evolution === null && (
                    <span className="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">
                      Premier mois
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Séparateur + titre Donuts ── */}
      {data.length >= 2 && showDonut && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "14px",
              paddingTop: "4px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <FaChartPie size={14} style={{ color: "#26c6b0" }} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#334155",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Comparaison visuelle mois par mois
            </span>
            <span
              style={{
                marginLeft: "auto",
                backgroundColor: "#26c6b015",
                color: "#26c6b0",
                borderRadius: "10px",
                padding: "2px 10px",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {Math.min(data.length - 1, 4)} paires
            </span>
          </div>

          {/* ── Donuts ── */}
          <MonthComparisonDonut data={data} formatPrice={formatPrice} />
        </div>
      )}
    </div>
  );
}
