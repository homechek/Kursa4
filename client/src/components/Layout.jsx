import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, LogOut, Moon, Sun, UserRound } from "lucide-react";

import { setToken } from "../lib/api.js";
import { useI18n } from "../lib/i18n.jsx";

function isAuthed() {
  return Boolean(localStorage.getItem("pp_token"));
}

export function Layout() {
  const nav = useNavigate();
  const loc = useLocation();
  const authed = isAuthed();
  const { lang, setLang, t } = useI18n();

  const [theme, setTheme] = React.useState(() => localStorage.getItem("pp_theme") || "light");
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pp_theme", theme);
  }, [theme]);

  React.useEffect(() => {
    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme = "light";
    }
  }, []);

  const onLogout = () => {
    setToken("");
    nav("/login");
  };

  const showTop = true;

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      {showTop ? (
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[color:var(--surface)]/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link to={authed ? "/dashboard" : "/login"} className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)]">
                <Briefcase size={18} />
              </div>
              <div className="leading-tight">
                <div className="font-semibold">{t("appName")}</div>
                <div className="text-xs text-[var(--muted)]">{t("mvp")}</div>
              </div>
            </Link>

            <nav className="flex items-center gap-2">
              <select
                aria-label={t("language")}
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-sm text-[var(--text)] outline-none ring-[var(--ring)] focus:ring-4 sm:block"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>

              <button
                type="button"
                onClick={() => setTheme((v) => (v === "dark" ? "light" : "dark"))}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                aria-label={t("theme")}
                title={t("theme")}
              >
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
                <span className="hidden sm:inline">{theme === "dark" ? t("themeDark") : t("themeLight")}</span>
              </button>

              {authed ? (
                <>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                  >
                    <UserRound size={16} />
                    {t("dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                  >
                    <LogOut size={16} />
                    {t("logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-2)]"
                  >
                    {t("login")}
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-[var(--primary-contrast)] hover:bg-[var(--primary-hover)]"
                  >
                    {t("register")}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 text-xs text-[var(--muted)]">
          <div>© {new Date().getFullYear()} ProfPortfolio</div>
          <div className="hidden sm:block">React + Tailwind + Express + Prisma</div>
        </div>
      </footer>
    </div>
  );
}

