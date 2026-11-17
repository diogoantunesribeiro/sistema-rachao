import {
  signOut,
  useActionMutation,
  useActionQuery,
  useSession,
} from "@agent-native/core/client/hooks";
import {
  IconCalendarEvent,
  IconChevronRight,
  IconCircleCheck,
  IconReceipt2,
  IconUserCircle,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { useT } from "@agent-native/core/client/i18n";
import { ptBR as calendarPtBR } from "react-day-picker/locale";
import { ptBR } from "@/i18n";
import { Link } from "react-router";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export function meta() {
  return [
    { title: ptBR.dashboard.title },
    { name: "description", content: ptBR.dashboard.description },
  ];
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default function DashboardRoute() {
  const t = useT();
  const { session } = useSession();
  const { data: events, isLoading, error } = useActionQuery("list-events", {
    limit: 50,
  });
  const createEvent = useActionMutation("create-event");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("events");
  const [formError, setFormError] = useState("");
  const firstName =
    session?.name?.trim().split(/\s+/)[0] ?? session?.email?.split("@")[0];

  async function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const formData = new FormData(event.currentTarget);
    if (!selectedDate) {
      setFormError(t("dashboard.dateRequired"));
      return;
    }
    try {
      await createEvent.mutateAsync({
        title: String(formData.get("title")),
        eventDate: selectedDate,
      });
      setDialogOpen(false);
      setSelectedDate("");
    } catch {
      setFormError(t("dashboard.createError"));
    }
  }

  const tabs = [
    { id: "events", label: t("dashboard.events"), icon: IconReceipt2 },
    { id: "activity", label: t("dashboard.activity"), icon: IconCircleCheck },
    { id: "profile", label: t("dashboard.profile"), icon: IconUserCircle },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-wrap">
        <header className="dashboard-header">
          <Link className="dashboard-brand" to="/dashboard" aria-label={t("dashboard.brandHome")}>
            <span className="dashboard-brand-mark" aria-hidden="true">
              <IconReceipt2 size={21} stroke={2.2} />
            </span>
            <span>rachão</span>
          </Link>
          <button
            className="profile-avatar"
            type="button"
            aria-label={t("dashboard.openProfile")}
            onClick={() => setActiveTab("profile")}
          >
            <IconUserCircle size={27} stroke={1.7} />
          </button>
        </header>

        <section className="dashboard-intro">
          <p className="dashboard-kicker">{t("dashboard.kicker")}</p>
          <h1>{firstName ? t("dashboard.greeting", { name: firstName }) : t("dashboard.greetingFallback")}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </section>

        {activeTab === "events" ? (
          <>
            <button
              className="new-event-button"
              type="button"
              onClick={() => {
                setFormError("");
                setDialogOpen(true);
              }}
            >
              <span aria-hidden="true">+</span> {t("dashboard.newEvent")}
            </button>

            <section className="events-section" aria-labelledby="events-title">
              <div className="events-section-heading">
                <h2 id="events-title">{t("dashboard.events")}</h2>
                <span className="event-count">
                  {t("dashboard.eventCount", {
                    count: events?.length ?? 0,
                    unit: events?.length === 1 ? t("dashboard.activeOne") : t("dashboard.activeMany"),
                  })}
                </span>
              </div>

              {error ? (
                <div className="dashboard-message dashboard-error" role="alert">
                  {t("dashboard.loadError")}
                </div>
              ) : isLoading ? (
                <div className="event-list-loading" aria-label={t("dashboard.loadingEvents")}>
                  <span />
                  <span />
                </div>
              ) : events?.length ? (
                <div className="event-list">
                  {events.map((event) => {
                    const participantCount =
                      event.registeredParticipants + event.guestParticipants;
                    return (
                      <Link
                        className="event-card"
                        key={event.id}
                        to={`/events/${event.id}`}
                      >
                        <div className="event-card-top">
                          <div className="event-card-title-wrap">
                            <h3>{event.title}</h3>
                            <span className={`event-role event-role-${event.role}`}>
                              {event.role === "organizer" ? t("dashboard.organizer") : t("dashboard.participant")}
                            </span>
                          </div>
                          <IconChevronRight className="event-chevron" size={21} />
                        </div>
                        <div className="event-card-meta">
                          <span className="event-date">
                            <IconCalendarEvent size={16} />
                            {formatDate(event.eventDate)}
                          </span>
                          <span className={`event-status event-status-${event.status}`}>
                            <span />
                            {event.status === "settling" ? t("dashboard.settlingStatus") : t("dashboard.openStatus")}
                          </span>
                        </div>
                        <div className="event-card-bottom">
                          <div>
                            <span className="event-total-label">{t("dashboard.totalSpent")}</span>
                            <strong>{formatBRL(event.totalSpentCents)}</strong>
                          </div>
                          <div className="participant-count">
                            <span className="participant-avatar-stack" aria-hidden="true">
                              <span><IconUserCircle size={15} /></span>
                              {participantCount > 1 && <span>+{participantCount - 1}</span>}
                            </span>
                            <span>
                              {t("dashboard.participantCount", {
                                count: participantCount,
                                unit: participantCount === 1
                                  ? t("dashboard.participantOne")
                                  : t("dashboard.participantMany"),
                              })}
                              {event.guestParticipants > 0 && t("dashboard.guestCount", { count: event.guestParticipants })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="event-empty-state">
                  <span className="empty-icon-wrap" aria-hidden="true">
                    <IconUsersGroup size={31} stroke={1.6} />
                  </span>
                  <h3>{t("dashboard.noEventsTitle")}</h3>
                  <p>{t("dashboard.noEventsDescription")}</p>
                  <button
                    className="new-event-button empty-create-button"
                    type="button"
                    onClick={() => setDialogOpen(true)}
                  >
                    {t("dashboard.createFirstEvent")}
                  </button>
                </div>
              )}
            </section>
          </>
        ) : activeTab === "activity" ? (
          <section className="dashboard-placeholder">
            <IconCircleCheck size={36} stroke={1.5} />
            <h2>Atividade</h2>
            <p>{t("dashboard.activityEmpty")}</p>
          </section>
        ) : (
          <section className="dashboard-placeholder">
            <IconUserCircle size={38} stroke={1.5} />
            <h2>{session?.name ?? t("dashboard.profile")}</h2>
            <p>{session?.email}</p>
            <button className="profile-signout-button" type="button" onClick={() => signOut()}>
              {t("dashboard.signOut")}
            </button>
          </section>
        )}
      </div>

      <nav className="bottom-nav" aria-label={t("dashboard.primaryNavigation")}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            className={`bottom-nav-item${activeTab === id ? " is-active" : ""}`}
            key={id}
            type="button"
            aria-current={activeTab === id ? "page" : undefined}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={21} stroke={activeTab === id ? 2.1 : 1.7} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rachaon-dialog" closeLabel={t("common.close")}>
          <DialogHeader>
            <DialogTitle>{t("dashboard.eventDialogTitle")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.eventDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <form className="event-create-form" onSubmit={handleCreateEvent}>
            <div className="event-create-field">
              <Label htmlFor="event-title">{t("dashboard.eventName")}</Label>
              <Input
                autoFocus
                id="event-title"
                name="title"
                maxLength={120}
                placeholder={t("dashboard.eventNamePlaceholder")}
                required
              />
            </div>
            <div className="event-create-field">
              <Label htmlFor="event-date">{t("dashboard.eventDate")}</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="event-date-picker-trigger"
                    id="event-date"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={calendarOpen}
                    aria-required="true"
                    aria-invalid={Boolean(formError && !selectedDate)}
                    aria-describedby={formError && !selectedDate ? "event-date-error" : undefined}
                  >
                    <IconCalendarEvent size={18} aria-hidden="true" />
                    {selectedDate
                      ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
                          new Date(`${selectedDate}T12:00:00`),
                        )
                      : <span className="event-date-placeholder">{t("dashboard.selectDate")}</span>}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="event-calendar-popover">
                  <Calendar
                    className="event-calendar"
                    mode="single"
                    selected={selectedDate ? new Date(`${selectedDate}T12:00:00`) : undefined}
                    defaultMonth={selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()}
                    locale={calendarPtBR}
                    onSelect={(date) => {
                      if (date) {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        setSelectedDate(`${year}-${month}-${day}`);
                        setFormError("");
                        setCalendarOpen(false);
                      }
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {formError && <p className="event-form-error" id={!selectedDate ? "event-date-error" : undefined} role="alert">{formError}</p>}
            <DialogFooter>
              <button className="dialog-cancel-button" type="button" onClick={() => setDialogOpen(false)}>
                {t("dashboard.cancel")}
              </button>
              <button className="dialog-submit-button" type="submit" disabled={createEvent.isPending}>
                {createEvent.isPending ? t("dashboard.creating") : t("dashboard.create")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
