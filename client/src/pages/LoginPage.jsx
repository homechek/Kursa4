import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, LogIn } from "lucide-react";

import { api, setToken } from "../lib/api.js";
import { Button, Card, Input } from "../components/ui.jsx";
import { useI18n } from "../lib/i18n.jsx";

export function LoginPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { email, password } });
      setToken(data.token);
      nav("/dashboard");
    } catch (err) {
      setError(err?.data?.error || t("errorLogin"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <div className="flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)]">
          <KeyRound size={18} />
        </div>
        <div>
          <div className="text-lg font-semibold">{t("login")}</div>
          <div className="text-sm text-[var(--muted)]">{t("enterToEdit")}</div>
        </div>
      </div>

      <Card>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <Input label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error ? (
            <div className="rounded-xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="mt-1">
            <LogIn size={16} />
            {loading ? t("signingIn") : t("signIn")}
          </Button>

          <div className="text-center text-sm text-[var(--muted)]">
            {t("noAccount")}{" "}
            <Link to="/register" className="font-semibold text-[var(--primary)] hover:underline">
              {t("signUp")}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

