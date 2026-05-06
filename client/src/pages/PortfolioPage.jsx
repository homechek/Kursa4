import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award, Briefcase, Link as LinkIcon, Star } from "lucide-react";

import { api, getApiBaseUrl } from "../lib/api.js";
import { formatDate } from "../lib/format.js";
import { Badge, Card } from "../components/ui.jsx";
import { useI18n } from "../lib/i18n.jsx";

function levelLabel(level) {
  const n = Number(level) || 0;
  return `${Math.min(5, Math.max(1, n))}/5`;
}

function pickTr({ ru, en, zh, lang }) {
  if (lang === "en") return en || ru || "";
  if (lang === "zh") return zh || ru || "";
  return ru || "";
}

export function PortfolioPage() {
  const { username } = useParams();
  const { t, lang } = useI18n();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api(`/api/portfolio/${encodeURIComponent(username)}`);
        if (!alive) return;
        setData(res.user);
      } catch (err) {
        if (!alive) return;
        setError(err?.data?.error || "Не удалось загрузить портфолио");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [username]);

  if (loading) return <div className="py-10 text-sm text-[var(--muted)]">{t("loading")}</div>;
  if (error) return <div className="py-10 text-sm text-[var(--danger)]">{error}</div>;
  if (!data) return <div className="py-10 text-sm text-[var(--muted)]">{t("noData")}</div>;

  const p = data.profile || {};
  const apiBase = getApiBaseUrl();
  const fio = pickTr({ ru: p.fio, en: p.fioEn, zh: p.fioZh, lang }) || data.username;
  const bio = pickTr({ ru: p.bio, en: p.bioEn, zh: p.bioZh, lang }) || "—";

  return (
    <div className="mx-auto grid max-w-3xl gap-6 py-2">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          <ArrowLeft size={16} />
          {t("back")}
        </Link>
        <Badge className="border-[color:var(--primary)]/30 bg-[color:var(--primary)]/10 text-[var(--text)]">
          @{data.username}
        </Badge>
      </div>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
              {p.avatar ? (
                <img
                  src={String(p.avatar).startsWith("/uploads/") ? `${apiBase}${p.avatar}` : p.avatar}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-sm font-semibold text-[var(--muted)]">
                  PP
                </div>
              )}
            </div>
            <div>
              <div className="text-xl font-semibold">{fio}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{bio}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="gap-1">
              <Star size={14} /> {t("skillsCount", data.skills?.length || 0)}
            </Badge>
            <Badge className="gap-1">
              <Briefcase size={14} /> {t("projectsCount", data.projects?.length || 0)}
            </Badge>
            <Badge className="gap-1">
              <Award size={14} /> {t("achievementsCount", data.achievements?.length || 0)}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <div className="text-sm font-semibold text-[var(--text)]">{t("skills")}</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {data.skills?.length ? (
            data.skills.map((s) => (
              <div key={s.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">
                      {pickTr({ ru: s.title, en: s.titleEn, zh: s.titleZh, lang })}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {t("level")}: {levelLabel(s.level)}
                    </div>
                  </div>
                  <div className="h-2 w-16 rounded-full bg-[var(--border)]">
                    <div
                      className="h-2 rounded-full bg-[var(--primary)]"
                      style={{ width: `${(Math.min(5, Math.max(1, s.level)) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[var(--muted)]">{t("noSkills")}</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold text-[var(--text)]">{t("projects")}</div>
        <div className="mt-3 grid gap-3">
          {data.projects?.length ? (
            data.projects.map((p2) => (
              <div key={p2.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold">
                      {pickTr({ ru: p2.name, en: p2.nameEn, zh: p2.nameZh, lang })}
                    </div>
                    {pickTr({ ru: p2.description, en: p2.descriptionEn, zh: p2.descriptionZh, lang }) ? (
                      <div className="mt-1 text-sm text-[var(--muted)]">
                        {pickTr({ ru: p2.description, en: p2.descriptionEn, zh: p2.descriptionZh, lang })}
                      </div>
                    ) : null}
                  </div>
                  {p2.link ? (
                    <a
                      href={p2.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
                    >
                      <LinkIcon size={16} />
                      {t("link")}
                    </a>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[var(--muted)]">{t("noProjects")}</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold text-[var(--text)]">{t("achievements")}</div>
        <div className="mt-3 grid gap-2">
          {data.achievements?.length ? (
            data.achievements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">
                      {pickTr({ ru: a.title, en: a.titleEn, zh: a.titleZh, lang })}
                    </div>
                    <div className="text-xs text-[var(--muted)]">{formatDate(a.date)}</div>
                    {a.certificateUrl ? (
                      <a
                        href={a.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
                      >
                        <LinkIcon size={16} />
                        {t("certificate")}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-[var(--muted)]">{t("noAchievements")}</div>
          )}
        </div>
      </Card>
    </div>
  );
}

