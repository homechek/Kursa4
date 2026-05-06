import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";

import { api, setToken } from "../lib/api.js";
import { Button, Card, Input } from "../components/ui.jsx";
import { useI18n } from "../lib/i18n.jsx";

export function RegisterPage() {
  const nav = useNavigate();
  const { t } = useI18n();
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [errorDetails, setErrorDetails] = React.useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrorDetails([]);
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: { email, username, password },
      });
      setToken(data.token);
      nav("/dashboard");
    } catch (err) {
      const code = err?.data?.error || "";
      const details = err?.data?.details?.fieldErrors || null;

      if (code === "VALIDATION_ERROR" && details && typeof details === "object") {
        const lines = Object.entries(details)
          .flatMap(([field, msgs]) => (Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : []))
          .filter(Boolean);
        setError(code);
        setErrorDetails(lines);
      } else {
        setError(code || t("errorRegister"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-md gap-4">
      <div className="flex items-center gap-2">
        <div className="grid size-10 place-items-center rounded-2xl bg-[var(--primary)] text-[var(--primary-contrast)]">
          <UserPlus size={18} />
        </div>
        <div>
          <div className="text-lg font-semibold">{t("register")}</div>
          <div className="text-sm text-[var(--muted)]">{t("createAccount")}</div>
        </div>
      </div>

      <Card>
        <form className="grid gap-3" onSubmit={onSubmit}>
          <Input label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label={t("usernameLabel")}
            placeholder={t("usernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input
            label={t("passwordMin")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error ? (
            <div className="rounded-xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
              {error}
              {errorDetails?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {errorDetails.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? t("creating") : t("createAccount")}
          </Button>

          <div className="text-center text-sm text-[var(--muted)]">
            {t("alreadyHave")}{" "}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:underline">
              {t("signIn")}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

