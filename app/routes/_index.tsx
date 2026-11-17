import { appPath } from "@agent-native/core/client/api-path";
import { useT } from "@agent-native/core/client/i18n";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { IconEye, IconEyeOff, IconReceipt2 } from "@tabler/icons-react";
import { ptBR } from "@/i18n";

export function meta() {
  return [
    { title: ptBR.signup.title },
    { name: "description", content: ptBR.signup.description },
  ];
}

const passwordPattern = "(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}";

export default function HomeRoute() {
  const t = useT();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function clearFieldError(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    if (value.trim()) {
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const requiredFields = isLogin ? ["email", "password"] : ["name", "email", "phone", "password"];
    const formData = new FormData(event.currentTarget);
    const nextErrors = Object.fromEntries(
      requiredFields
        .filter((field) => !String(formData.get(field) ?? "").trim())
        .map((field) => [field, true]),
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    const credentials = {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    };
    const name = String(formData.get("name") ?? "").trim();

    try {
      if (!isLogin) {
        const registerResponse = await fetch("/_agent-native/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...credentials, name }),
        });
        const registerResult = await registerResponse.json();
        if (!registerResponse.ok || !registerResult.ok) {
          throw new Error("Não foi possível criar sua conta.");
        }
      }

      const loginResponse = await fetch("/_agent-native/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const loginResult = await loginResponse.json();
      if (!loginResponse.ok || !loginResult.ok) {
        throw new Error("Não foi possível entrar na sua conta.");
      }

      window.location.assign(appPath("/dashboard"));
    } catch {
      setMessage(isLogin ? t("signup.loginError") : t("signup.registerError"));
      setIsSubmitting(false);
    }
  }

  function switchMode() {
    setIsLogin((current) => !current);
    setMessage("");
    setErrors({});
  }

  return (
    <main className="rachaon-page">
      <div className="rachaon-glow rachaon-glow-one" aria-hidden="true" />
      <div className="rachaon-glow rachaon-glow-two" aria-hidden="true" />
      <section className="signup-shell" aria-labelledby="signup-title">
        <a className="brand" href="/" aria-label={t("signup.homeLink")}>
          <span className="brand-mark" aria-hidden="true">
            <IconReceipt2 size={23} stroke={2.2} />
          </span>
          <span>rachão</span>
        </a>

        <div className="signup-card">
          <div className="card-heading">
            <span className="eyebrow">{t("signup.eyebrow")}</span>
            <h1 id="signup-title">{isLogin ? t("signup.loginTitle") : t("signup.createTitle")}</h1>
            <p>
              {isLogin ? t("signup.loginSubtitle") : t("signup.createSubtitle")}
            </p>
          </div>

          <form className="signup-form" noValidate onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="form-field">
                <span>{t("signup.fullName")}</span>
                <input
                  autoComplete="name"
                  name="name"
                  placeholder={t("signup.fullNamePlaceholder")}
                  required
                  className={errors.name ? "input-error" : undefined}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  onChange={clearFieldError}
                />
                {errors.name && <span className="field-error" id="name-error">Este campo é obrigatório</span>}
              </label>
            )}

            <label className="form-field">
              <span>{t("signup.email")}</span>
              <input
                autoComplete="email"
                name="email"
                placeholder={t("signup.emailPlaceholder")}
                required
                type="email"
                className={errors.email ? "input-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                onChange={clearFieldError}
              />
              {errors.email && <span className="field-error" id="email-error">Este campo é obrigatório</span>}
            </label>

            {!isLogin && (
              <label className="form-field">
                <span>{t("signup.phone")}</span>
                <input
                  autoComplete="tel"
                  name="phone"
                  placeholder="+55 (11) 99999-0000"
                  required
                  type="tel"
                  className={errors.phone ? "input-error" : undefined}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  onChange={clearFieldError}
                />
                {errors.phone && <span className="field-error" id="phone-error">Este campo é obrigatório</span>}
              </label>
            )}

            <label className="form-field">
              <span>{t("signup.password")}</span>
              <span className="password-wrap">
                <input
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={isLogin ? undefined : 8}
                  name="password"
                  pattern={isLogin ? undefined : passwordPattern}
                  placeholder={t("signup.passwordPlaceholder")}
                  required
                  type={showPassword ? "text" : "password"}
                  className={errors.password ? "input-error" : undefined}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  onChange={clearFieldError}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? t("signup.hidePassword") : t("signup.showPassword")}
                >
                  {showPassword ? <IconEyeOff size={19} /> : <IconEye size={19} />}
                </button>
              </span>
              {errors.password && <span className="field-error" id="password-error">Este campo é obrigatório</span>}
              {!isLogin && (
                <span className="field-hint">
                  {t("signup.passwordHint")}
                </span>
              )}
            </label>

            <button className="submit-button" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("signup.submitting")
                : isLogin
                  ? t("signup.loginButton")
                  : t("signup.createButton")}
              {!isSubmitting && <span aria-hidden="true">↗</span>}
            </button>
            <p className="form-message" role="status" aria-live="polite">
              {message}
            </p>
          </form>

          <div className="mode-switch">
            <span>
              {isLogin ? t("signup.newToRachao") : t("signup.alreadyHaveAccount")}
            </span>{" "}
            <button type="button" onClick={switchMode}>
              {isLogin ? t("signup.createButton") : t("signup.loginButton")}
            </button>
          </div>
        </div>

        <p className="footer-note">{t("signup.footer")}</p>
      </section>
    </main>
  );
}
