import { IconArrowLeft, IconCalendarEvent, IconCake, IconFlame, IconHome, IconPaperclip, IconShoppingCart, IconUserCircle } from "@tabler/icons-react";
import { useState, type KeyboardEvent } from "react";
import { IconCopy } from "@tabler/icons-react";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Churrasco da Turma | Rachão" }];
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

const mockExpenses = [
  {
    title: "Carne e bebidas",
    category: "Mercado",
    icon: IconShoppingCart,
    amountCents: 48000,
    payer: "João Silva",
    split: "Dividido entre 8 participantes",
    date: "14 nov, 19:30",
    receipt: true,
  },
  {
    title: "Gelo e carvão",
    category: "Churrasco",
    icon: IconFlame,
    amountCents: 8750,
    payer: "Marina Costa",
    split: "Sua parte: R$ 10,94",
    date: "14 nov, 18:42",
    receipt: true,
  },
  {
    title: "Aluguel do espaço",
    category: "Espaço",
    icon: IconHome,
    amountCents: 95000,
    payer: "Pedro Almeida",
    split: "Dividido entre 8 participantes",
    date: "13 nov, 10:15",
    receipt: false,
  },
  {
    title: "Sobremesas",
    category: "Mercado",
    icon: IconCake,
    amountCents: 33250,
    payer: "Você",
    split: "Sua parte: R$ 41,56",
    date: "14 nov, 20:05",
    receipt: true,
  },
];

const mockTransfers = [
  { payer: "Marina Costa", payerInitials: "MC", receiver: "João Silva", receiverInitials: "JS", amountCents: 6000, pixKey: "joao.silva@email.com" },
  { payer: "Pedro Almeida", payerInitials: "PA", receiver: "Você", receiverInitials: "VC", amountCents: 14500, pixKey: "(11) 99999-0000" },
  { payer: "Pedro Almeida", payerInitials: "PA", receiver: "João Silva", receiverInitials: "JS", amountCents: 2250, pixKey: "joao.silva@email.com" },
];

const mockParticipants = [
  { name: "Você", initials: "VC", balanceCents: 14500 },
  { name: "João Silva", initials: "JS", balanceCents: 8250 },
  { name: "Marina Costa", initials: "MC", balanceCents: -6000 },
  { name: "Pedro Almeida", initials: "PA", balanceCents: -16750 },
  { name: "Ana Martins", initials: "AM", balanceCents: 0 },
  { name: "Lucas Rocha", initials: "LR", balanceCents: 0 },
  { name: "Bia Oliveira", initials: "BO", balanceCents: 0 },
  { name: "Rafa Santos", initials: "RS", balanceCents: 0 },
];

export default function EventDetailRoute() {
  const [activeTab, setActiveTab] = useState<"expenses" | "transfers" | "participants">("expenses");
  const [pixFeedback, setPixFeedback] = useState("");
  const tabOrder = ["expenses", "transfers", "participants"] as const;

  async function copyPix(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setPixFeedback("Chave PIX copiada!");
    } catch {
      setPixFeedback("Não foi possível copiar a chave PIX.");
    }
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;

    event.preventDefault();
    const nextIndex = (tabOrder.indexOf(activeTab) + direction + tabOrder.length) % tabOrder.length;
    const nextTab = tabOrder[nextIndex]!;
    setActiveTab(nextTab);
    document.getElementById(`event-tab-${nextTab}`)?.focus();
  }

  return (
    <main className="event-page">
      <div className="event-page-wrap">
        <header className="event-topbar">
          <Link className="event-icon-button" to="/dashboard" aria-label="Voltar para eventos">
            <IconArrowLeft size={21} />
          </Link>
          <h1>Churrasco da Turma</h1>
          <button className="event-icon-button" type="button" aria-label="Mais opções">
            <span aria-hidden="true">···</span>
          </button>
        </header>

        <section className="event-summary-card">
          <div className="event-summary-meta">
            <span className="event-active-badge"><i /> Ativo</span>
            <span className="event-date-label"><IconCalendarEvent size={15} /> 14 nov 2025</span>
          </div>
          <span className="event-summary-label">Total gasto no evento</span>
          <strong className="event-summary-total">R$ 1.850,00</strong>
          <div className="event-balance-highlight">
            <span className="event-balance-icon"><IconUserCircle size={19} /></span>
            <span><small>Seu saldo</small><strong>Você tem a receber <b>R$ 145,00</b></strong></span>
            <span className="event-balance-arrow" aria-hidden="true">↗</span>
          </div>
        </section>

        <div className="event-tabs" role="tablist" aria-label="Seções do evento">
          <button className="event-tab-button" id="event-tab-expenses" type="button" role="tab" aria-selected={activeTab === "expenses"} aria-controls="event-panel-expenses" tabIndex={activeTab === "expenses" ? 0 : -1} onClick={() => setActiveTab("expenses")} onKeyDown={handleTabKeyDown}>Despesas</button>
          <button className="event-tab-button" id="event-tab-transfers" type="button" role="tab" aria-selected={activeTab === "transfers"} aria-controls="event-panel-transfers" tabIndex={activeTab === "transfers" ? 0 : -1} onClick={() => setActiveTab("transfers")} onKeyDown={handleTabKeyDown}>Transferências</button>
          <button className="event-tab-button" id="event-tab-participants" type="button" role="tab" aria-selected={activeTab === "participants"} aria-controls="event-panel-participants" tabIndex={activeTab === "participants" ? 0 : -1} onClick={() => setActiveTab("participants")} onKeyDown={handleTabKeyDown}>Participantes</button>
        </div>

        <div className="event-tab-panel" id="event-panel-expenses" role="tabpanel" aria-labelledby="event-tab-expenses" hidden={activeTab !== "expenses"}>
            <button className="event-primary-action event-tab-add-expense" type="button"><span aria-hidden="true">+</span> Adicionar despesa</button>
            <section className="event-expenses-section">
              <div className="event-section-heading">
                <div><span className="event-section-kicker">SEU RATEIO</span><h2>Despesas registradas</h2></div>
                <span className="event-count-pill">4 lançamentos</span>
              </div>
              <div className="event-expense-list">
                {mockExpenses.map((expense) => (
                  <article className="event-expense-card" key={expense.title}>
                    <div className="expense-icon" aria-hidden="true"><expense.icon size={20} stroke={1.8} /></div>
                    <div className="expense-main">
                      <div className="expense-title-row"><h3>{expense.title}</h3><strong>{formatBRL(expense.amountCents)}</strong></div>
                      <span className="expense-category">{expense.category}</span>
                      <div className="expense-detail-line"><span>Pago por <b>{expense.payer}</b></span><span>{expense.split}</span></div>
                      <div className="expense-footer"><span>{expense.receipt && <><IconPaperclip size={14} /> Comprovante anexado <i>·</i></>} {expense.date}</span><span className="expense-chevron" aria-hidden="true">›</span></div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
        </div>

        <div className="event-tab-panel" id="event-panel-transfers" role="tabpanel" aria-labelledby="event-tab-transfers" hidden={activeTab !== "transfers"}>
            <section className="event-white-panel event-balances-panel">
              <div className="event-panel-heading"><div><span className="event-section-kicker">ACERTOS</span><h2>Transferências a realizar</h2></div><span className="event-mini-icon">↗</span></div>
              {pixFeedback && <p className="balance-pix-feedback" role="status">{pixFeedback}</p>}
              <div className="balance-view-panel">
                  <p className="event-panel-caption">Confira quem precisa pagar e para quem.</p>
                  <div className="group-transfer-list">
                    {mockTransfers.map((transfer) => (
                      <article className="group-transfer-card" key={`${transfer.payer}-${transfer.receiver}`}>
                        <div className="group-transfer-top">
                          <span className="group-transfer-person"><span className="balance-avatar">{transfer.payerInitials}</span><strong>{transfer.payer}</strong></span>
                          <span className="group-transfer-arrow" aria-hidden="true">→</span>
                          <span className="group-transfer-person"><span className="balance-avatar group-transfer-receiver-avatar">{transfer.receiverInitials}</span><strong>{transfer.receiver}</strong></span>
                          <strong className="group-transfer-amount">{formatBRL(transfer.amountCents)}</strong>
                        </div>
                        <div className="group-transfer-pix">
                          <span><small>Chave PIX do recebedor</small><strong>{transfer.pixKey}</strong></span>
                          <button type="button" onClick={() => void copyPix(transfer.pixKey)}><IconCopy size={15} /> Copiar PIX</button>
                        </div>
                      </article>
                    ))}
                  </div>
              </div>
            </section>
        </div>

        <div className="event-tab-panel" id="event-panel-participants" role="tabpanel" aria-labelledby="event-tab-participants" hidden={activeTab !== "participants"}>
            <section className="event-white-panel event-participants-panel">
              <div className="event-panel-heading"><div><span className="event-section-kicker">A TURMA</span><h2>Participantes <small>8</small></h2></div><span className="event-mini-icon">＋</span></div>
              <p className="event-panel-caption">Pessoas neste rateio</p>
              <div className="participant-list">
                {mockParticipants.map((participant, index) => (
                  <div className="participant-row" key={participant.name}>
                    <span className={`participant-avatar participant-avatar-${index % 4}`}>{participant.initials}</span>
                    <strong>{participant.name}</strong>
                    {index === 0 && <span className="participant-you-badge">VOCÊ</span>}
                    <span className={`participant-balance ${participant.balanceCents > 0 ? "balance-positive" : participant.balanceCents < 0 ? "balance-negative" : "balance-neutral"}`}>
                      {participant.balanceCents > 0 ? "+ " : participant.balanceCents < 0 ? "− " : ""}{formatBRL(Math.abs(participant.balanceCents))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
        </div>
        <footer className="event-footer-note"><span>rachão</span><i>·</i> Dividir fica mais leve juntos.</footer>
      </div>
    </main>
  );
}
