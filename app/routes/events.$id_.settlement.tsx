import { useState } from "react";
import { IconArrowLeft, IconBolt, IconCheck, IconCircleCheck, IconClock, IconCopy, IconInfoCircle, IconX } from "@tabler/icons-react";
import { Link, useParams } from "react-router";

export function meta() {
  return [{ title: "Acerto de Contas | Rachão" }];
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

type TransferStatus = "pending" | "awaiting" | "paid";

type Transfer = {
  id: number;
  from: string;
  fromInitials: string;
  to: string;
  toInitials: string;
  amountCents: number;
  status: TransferStatus;
  pixLabel: string;
  pixValue: string;
};

export default function SettlementRoute() {
  const { id = "demo" } = useParams();
  const [showInfo, setShowInfo] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isArchived, setIsArchived] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: 1,
      from: "Você",
      fromInitials: "VC",
      to: "Lucas Mendes",
      toInitials: "LM",
      amountCents: 8500,
      status: "pending",
      pixLabel: "Chave PIX (E-mail)",
      pixValue: "lucas.mendes@email.com",
    },
    {
      id: 2,
      from: "Mariana Costa",
      fromInitials: "MC",
      to: "Lucas Mendes",
      toInitials: "LM",
      amountCents: 14000,
      status: "paid",
      pixLabel: "Chave PIX (Celular)",
      pixValue: "(11) 98765-4321",
    },
    {
      id: 3,
      from: "Rafael Lima",
      fromInitials: "RL",
      to: "Carlos Eduardo",
      toInitials: "CE",
      amountCents: 6000,
      status: "pending",
      pixLabel: "Chave PIX (CPF)",
      pixValue: "123.456.789-00",
    },
  ]);
  const creditors = [
    { name: "Lucas Mendes", initials: "LM", amountCents: 22500 },
    { name: "Carlos Eduardo", initials: "CE", amountCents: 6000 },
  ];
  const allSettled = transfers.every((transfer) => transfer.status === "paid");

  async function copyPix(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback("Chave PIX copiada!");
    } catch {
      setCopyFeedback("Não foi possível copiar a chave PIX.");
    }
  }

  function updateTransfer(id: number, status: TransferStatus) {
    setTransfers((current) => current.map((transfer) => (
      transfer.id === id ? { ...transfer, status } : transfer
    )));
  }

  return (
    <main className="event-page settlement-page">
      <div className="event-page-wrap settlement-page-wrap">
        <header className="event-topbar settlement-topbar">
          <Link className="event-icon-button" to={`/events/${id}`} aria-label="Voltar para o evento">
            <IconArrowLeft size={21} />
          </Link>
          <h1>Acerto de Contas</h1>
          <button className="event-icon-button" type="button" aria-label="Sobre o cálculo do rateio" onClick={() => setShowInfo(true)}>
            <IconInfoCircle size={20} />
          </button>
        </header>

        <section className="settlement-summary-card">
          <span className="settlement-event-title">Churrasco da Turma <span>(Rateio Fechado)</span></span>
          <span className="settlement-total-label">Total rateado</span>
          <strong className="settlement-total">R$ 1.850,00</strong>
          <span className="settlement-optimized-badge"><IconBolt size={15} fill="currentColor" /> Quitação otimizada <i>Algoritmo guloso</i></span>
          <p>Calculamos a menor quantidade possível de transferências para liquidar todas as pendências.</p>
        </section>

        <section className="settlement-personal-card">
          <div className="settlement-section-title"><span className="settlement-section-icon"><IconClock size={18} /></span><h2>Resumo do seu saldo</h2></div>
          <span className="settlement-personal-status">Você tem pendências a acertar</span>
          <strong className="settlement-due-amount">R$ 85,00</strong>
          <p>Transfira o valor exato via PIX para o recebedor indicado abaixo e confirme o pagamento.</p>
        </section>

        <section className="settlement-creditors-card">
          <div className="settlement-section-title"><span className="settlement-section-icon"><IconCircleCheck size={18} /></span><h2>Quem recebe</h2></div>
          <div className="settlement-creditor-list">
            {creditors.map((creditor) => (
              <div className="settlement-creditor-row" key={creditor.name}>
                <span className="settlement-avatar">{creditor.initials}</span>
                <strong>{creditor.name}</strong>
                <span className="settlement-creditor-amount"><small>a receber</small>{formatBRL(creditor.amountCents)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="settlement-transfers-section">
          <div className="settlement-transfers-heading">
            <span className="settlement-section-kicker">PASSO A PASSO</span>
            <h2>Transferências a realizar</h2>
            <p>Quem deve a quem</p>
          </div>
          {copyFeedback && <p className="settlement-copy-feedback" role="status">{copyFeedback}</p>}
          <div className="settlement-transfer-list">
            {transfers.map((transfer) => (
              <article className={`settlement-transfer-card settlement-transfer-${transfer.status}`} key={transfer.id}>
                <div className="settlement-transfer-head">
                  <div className="settlement-flow">
                    <span className="settlement-flow-person"><span className="settlement-avatar">{transfer.fromInitials}</span><strong>{transfer.from}</strong></span>
                    <span className="settlement-flow-arrow" aria-hidden="true">→</span>
                    <span className="settlement-flow-person"><span className="settlement-avatar settlement-avatar-recipient">{transfer.toInitials}</span><strong>{transfer.to}</strong></span>
                  </div>
                  <div className="settlement-transfer-amount-status">
                    <strong>{formatBRL(transfer.amountCents)}</strong>
                    <span className={`settlement-status settlement-status-${transfer.status}`}>
                      {transfer.status === "paid" ? <><IconCheck size={13} /> Pago</> : transfer.status === "awaiting" ? <><IconClock size={13} /> Aguardando confirmação</> : "Pendente"}
                    </span>
                  </div>
                </div>

                <div className="settlement-pix-box">
                  <div><span>{transfer.pixLabel}</span><strong>{transfer.pixValue}</strong></div>
                  {transfer.status !== "paid" && (
                    <button className="settlement-copy-button" type="button" onClick={() => void copyPix(transfer.pixValue)} aria-label={`Copiar ${transfer.pixLabel}`}>
                      <IconCopy size={16} /><span>Copiar chave PIX</span>
                    </button>
                  )}
                </div>

                {transfer.status === "paid" ? (
                  <button className="settlement-paid-button" type="button" disabled><IconCheck size={17} /> Pagamento realizado</button>
                ) : transfer.status === "awaiting" ? (
                  <div className="settlement-awaiting-actions">
                    <span>Pagamento informado, aguardando validação do recebedor.</span>
                    <button className="settlement-confirm-button" type="button" onClick={() => updateTransfer(transfer.id, "paid")}>Confirmar recebimento</button>
                  </div>
                ) : (
                  <button className="settlement-confirm-button" type="button" onClick={() => updateTransfer(transfer.id, "awaiting")}>Confirmar pagamento</button>
                )}
              </article>
            ))}
          </div>
        </section>

        <footer className="settlement-bottom-actions">
          <div className="settlement-bottom-inner">
            <button className="settlement-archive-button" type="button" disabled={!allSettled || isArchived} onClick={() => setIsArchived(true)}>{isArchived ? "Evento arquivado" : "Arquivar evento"}</button>
            {!allSettled && <span className="settlement-archive-hint">Disponível após todos os pagamentos</span>}
            <Link className="settlement-dashboard-link" to="/dashboard">Voltar para o painel geral</Link>
          </div>
        </footer>
      </div>

      {showInfo && (
        <div className="settlement-info-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowInfo(false);
        }}>
          <section className="settlement-info-dialog" role="dialog" aria-modal="true" aria-labelledby="settlement-info-title">
            <button className="settlement-info-close" type="button" aria-label="Fechar explicação" onClick={() => setShowInfo(false)}><IconX size={20} /></button>
            <span className="settlement-info-mark"><IconBolt size={21} /></span>
            <h2 id="settlement-info-title">Quitação otimizada</h2>
            <p>O cálculo reúne os saldos do grupo e sugere o menor número de transferências para que todos recebam exatamente o que têm direito.</p>
            <button className="settlement-info-ok" type="button" onClick={() => setShowInfo(false)}>Entendi</button>
          </section>
        </div>
      )}
    </main>
  );
}
