import { useAuthContext } from "../context/AuthContext.tsx";
import { useTrips } from "../hooks/useTrips.ts";
import { useBalances } from "../hooks/useBalances.ts";
import "../styles/dashboard.css";

const Page5 = () => {
  const { user } = useAuthContext();
  const { activeGroupId, activeGroupName } = useTrips();
  const { balances, loading, error, loadBalances } = useBalances(activeGroupId);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Saldos y Cuentas</h2>
        <p className="page-subtitle">
          Revisa el desglose de deudas de cada integrante y la propuesta inteligente para saldar cuentas.
        </p>
      </div>

      {!activeGroupId ? (
        <div className="alert-warning">
          <span className="alert-icon">⚠️</span>
          <h4>Ningún viaje activo seleccionado</h4>
          <p>Por favor, ve a la pestaña de <strong>Viajes</strong> para crear uno o seleccionar un viaje de tu lista.</p>
        </div>
      ) : (
        <div className="page-container">

          <div className="active-trip-banner">
            <div>
              <span className="banner-label">Viaje Activo</span>
              <h3 className="banner-title">{activeGroupName}</h3>
            </div>
            <button type="button" onClick={loadBalances} className="btn-outline">
              🔄 Recargar Cuentas
            </button>
          </div>

          {error && <div className="alert-danger">{error}</div>}
          {loading && <p className="loading-text">Calculando deudas y balances...</p>}

          {balances && !loading && (
            <div className="dashboard-grid-large">

              {/* COLUMNA IZQUIERDA: RESUMEN */}
              <div className="left-column">
                <div className="balance-summary-cards">
                  <div className="balance-card">
                    <span className="balance-card-label">Gasto Total del Grupo</span>
                    <h3 className="balance-card-value">{balances.total_group_spent.toFixed(2)} €</h3>
                  </div>
                  <div className="balance-card">
                    <span className="balance-card-label">Cuota por Persona</span>
                    <h3 className="balance-card-value dark">{balances.share_per_member.toFixed(2)} €</h3>
                  </div>
                </div>

                <div className="left-column">
                  <h3 className="section-title">Resumen de Cuentas</h3>
                  <div className="card-list">
                    {balances.member_balances.map((mb) => {
                      const hasPositiveBalance = mb.net_balance > 0.01;
                      const hasNegativeBalance = mb.net_balance < -0.01;

                      let balanceColor = "#667085";
                      let balanceBg = "#f4f5f7";
                      let balanceLabel = "Al día";
                      let balanceText = "0.00 €";

                      if (hasPositiveBalance) {
                        balanceColor = "#15803d";
                        balanceBg = "#dcfce7";
                        balanceLabel = "Se le debe devolver";
                        balanceText = `+${mb.net_balance.toFixed(2)} €`;
                      } else if (hasNegativeBalance) {
                        balanceColor = "#b91c1c";
                        balanceBg = "#fee2e2";
                        balanceLabel = "Debe aportar";
                        balanceText = `${mb.net_balance.toFixed(2)} €`;
                      }

                      return (
                        <div key={mb.user_id} className="list-card">
                          <div>
                            <h4 className="card-title">
                              {mb.user_name}
                              {mb.user_id === user?.id && <span className="member-me">(Tú)</span>}
                            </h4>
                            <p className="card-subtitle">
                              Aportó: <strong>{mb.total_paid.toFixed(2)} €</strong>
                            </p>
                          </div>
                          <div className="balance-right-col">
                            <span className="balance-net" style={{ color: balanceColor }}>
                              {balanceText}
                            </span>
                            <span
                              className="balance-status-badge"
                              style={{ background: balanceBg, color: balanceColor }}
                            >
                              {balanceLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA: PROPUESTA DE LIQUIDACIÓN */}
              <div className="settlement-panel">
                <div>
                  <h3 className="section-title">Propuesta de Liquidación</h3>
                  <p className="page-subtitle">
                    Método optimizado para saldar cuentas con la menor cantidad de transacciones.
                  </p>
                </div>

                <hr className="divider" />

                {balances.suggested_transfers.length === 0 ? (
                  <div className="settlement-empty">
                    <span className="emoji">🎉</span>
                    <h4>¡Cuentas al día!</h4>
                    <p>Todos han aportado exactamente su cuota. No es necesario realizar transferencias.</p>
                  </div>
                ) : (
                  <div className="card-list">
                    {balances.suggested_transfers.map((trans, idx) => (
                      <div key={idx} className="transfer-card">
                        <div className="transfer-users">
                          <div className="transfer-user">
                            <span className="transfer-label">Deudor</span>
                            <span className="transfer-name-debtor">{trans.from_user_name}</span>
                          </div>
                          <div className="transfer-arrow">➡️</div>
                          <div className="transfer-user right">
                            <span className="transfer-label">Acreedor</span>
                            <span className="transfer-name-creditor">{trans.to_user_name}</span>
                          </div>
                        </div>
                        <div className="transfer-amount">
                          <span className="transfer-amount-label">Debe transferir:</span>
                          <strong className="transfer-amount-value">{trans.amount.toFixed(2)} €</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page5;