import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

import { api, getApiBaseUrl, setToken } from "../lib/api.js";
import { formatDate } from "../lib/format.js";
import { Badge, Button, Card, Input, SectionTitle, Textarea } from "../components/ui.jsx";
import { useI18n } from "../lib/i18n.jsx";

function AuthGate({ children }) {
  const nav = useNavigate();
  React.useEffect(() => {
    const token = localStorage.getItem("pp_token");
    if (!token) nav("/login");
  }, [nav]);
  return children;
}

export function DashboardPage() {
  return (
    <AuthGate>
      <DashboardInner />
    </AuthGate>
  );
}

function DashboardInner() {
  const nav = useNavigate();
  const { t } = useI18n();
  const avatarInputRef = React.useRef(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState({
    fio: "",
    bio: "",
    avatar: "",
  });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  const [skillTitle, setSkillTitle] = React.useState("");
  const [skillLevel, setSkillLevel] = React.useState(3);
  const [addingSkill, setAddingSkill] = React.useState(false);

  const [projName, setProjName] = React.useState("");
  const [projDesc, setProjDesc] = React.useState("");
  const [projLink, setProjLink] = React.useState("");
  const [addingProject, setAddingProject] = React.useState(false);

  const [achTitle, setAchTitle] = React.useState("");
  const [achDate, setAchDate] = React.useState("");
  const [achCert, setAchCert] = React.useState("");
  const [addingAch, setAddingAch] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api("/api/me/dashboard", { auth: true });
      setUser(data.user);
      setProfile({
        fio: data.user.profile?.fio || "",
        bio: data.user.profile?.bio || "",
        avatar: data.user.profile?.avatar || "",
      });
    } catch (err) {
      if (err.status === 401) {
        setToken("");
        nav("/login");
        return;
      }
      setError(err?.data?.error || t("errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [nav, t]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api("/api/me/profile", {
        method: "PUT",
        auth: true,
        body: { fio: profile.fio, bio: profile.bio, avatar: profile.avatar || null },
      });
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorSaveProfile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const onUploadAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      setError(t("errorAvatarNoFile"));
      return;
    }
    setUploadingAvatar(true);
    setError("");
    try {
      const token = localStorage.getItem("pp_token") || "";
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      const res = await fetch(`${getApiBaseUrl()}/api/me/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error(data?.error || "UPLOAD_FAILED"), { data, status: res.status });

      setProfile((p) => ({ ...p, avatar: data.avatar || "" }));
      setAvatarFile(null);
      await load();
    } catch (err) {
      const code = err?.data?.error || err?.message || "";
      if (code === "FILE_TOO_LARGE") setError(t("errorAvatarTooLarge"));
      else if (code === "INVALID_FILE_TYPE") setError(t("errorAvatarType"));
      else if (code === "NO_FILE") setError(t("errorAvatarNoFile"));
      else setError(t("errorAvatarUpload"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onAddSkill = async (e) => {
    e.preventDefault();
    setAddingSkill(true);
    try {
      await api("/api/me/skills", {
        method: "POST",
        auth: true,
        body: { title: skillTitle, level: Number(skillLevel) },
      });
      setSkillTitle("");
      setSkillLevel(3);
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorAddSkill"));
    } finally {
      setAddingSkill(false);
    }
  };

  const onDeleteSkill = async (id) => {
    try {
      await api(`/api/me/skills/${id}`, { method: "DELETE", auth: true });
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorDelSkill"));
    }
  };

  const onAddProject = async (e) => {
    e.preventDefault();
    setAddingProject(true);
    try {
      await api("/api/me/projects", {
        method: "POST",
        auth: true,
        body: { name: projName, description: projDesc, link: projLink || null },
      });
      setProjName("");
      setProjDesc("");
      setProjLink("");
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorAddProject"));
    } finally {
      setAddingProject(false);
    }
  };

  const onDeleteProject = async (id) => {
    try {
      await api(`/api/me/projects/${id}`, { method: "DELETE", auth: true });
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorDelProject"));
    }
  };

  const onAddAchievement = async (e) => {
    e.preventDefault();
    setAddingAch(true);
    try {
      await api("/api/me/achievements", {
        method: "POST",
        auth: true,
        body: { title: achTitle, date: achDate, certificateUrl: achCert || null },
      });
      setAchTitle("");
      setAchDate("");
      setAchCert("");
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorAddAch"));
    } finally {
      setAddingAch(false);
    }
  };

  const onDeleteAchievement = async (id) => {
    try {
      await api(`/api/me/achievements/${id}`, { method: "DELETE", auth: true });
      await load();
    } catch (err) {
      setError(err?.data?.error || t("errorDelAch"));
    }
  };

  if (loading) {
    return <div className="py-10 text-sm text-[var(--muted)]">{t("loading")}</div>;
  }

  if (!user) {
    return <div className="py-10 text-sm text-[var(--muted)]">{t("noData")}</div>;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--muted)]">{t("youAreLoggedInAs")}</div>
          <div className="text-xl font-semibold">{user.email}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>@{user.username}</Badge>
            <Link
              to={`/portfolio/${user.username}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              {t("publicPage")} <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[color:var(--danger)]/30 bg-[color:var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          {error}
        </div>
      ) : null}

      <Card>
        <SectionTitle
          title={t("profile")}
          subtitle={t("profileSubtitle")}
        />
        <form className="mt-4 grid gap-3" onSubmit={onSaveProfile}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label={t("fio")}
              value={profile.fio}
              onChange={(e) => setProfile((p) => ({ ...p, fio: e.target.value }))}
              required
            />
            <div className="grid gap-2">
              <div className="text-sm text-[var(--muted)]">{t("avatar")}</div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="size-14 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
                  {profile.avatar ? (
                    <img
                      src={`${getApiBaseUrl()}${profile.avatar}`}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-[var(--muted)]">—</div>
                  )}
                </div>
                <div className="grid gap-2">
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="secondary" onClick={() => avatarInputRef.current?.click()}>
                      {t("chooseFile")}
                    </Button>
                    <div className="max-w-[280px] truncate text-xs text-[var(--muted)]">
                      {avatarFile?.name || t("noFileChosen")}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--muted)]">{t("selectImageHint")}</div>
                  <Button type="button" onClick={onUploadAvatar} disabled={!avatarFile || uploadingAvatar}>
                    {uploadingAvatar ? t("avatarUploading") : t("avatarUpload")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Textarea
            label={t("bio")}
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? t("saving") : t("save")}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title={t("skills")} subtitle={t("skillsSubtitle")} />
          <form className="mt-4 grid gap-3" onSubmit={onAddSkill}>
            <Input label={t("title")} value={skillTitle} onChange={(e) => setSkillTitle(e.target.value)} required />
            <Input
              label={t("level")}
              type="number"
              min={1}
              max={5}
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
              required
            />
            <Button type="submit" disabled={addingSkill}>
              <Plus size={16} />
              {addingSkill ? t("adding") : t("add")}
            </Button>
          </form>

          <div className="mt-4 grid gap-3">
            {user.skills?.length ? (
              user.skills.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{s.title}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {t("level")}: {s.level}/5
                    </div>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => onDeleteSkill(s.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--muted)]">{t("noSkills")}</div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle title={t("projects")} subtitle={t("projectsSubtitle")} />
          <form className="mt-4 grid gap-3" onSubmit={onAddProject}>
            <Input label={t("title")} value={projName} onChange={(e) => setProjName(e.target.value)} required />
            <Textarea
              label={t("description")}
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              placeholder={t("projectDescPlaceholder")}
            />
            <Input
              label={t("link")}
              placeholder="https://github.com/..."
              value={projLink}
              onChange={(e) => setProjLink(e.target.value)}
            />
            <Button type="submit" disabled={addingProject}>
              <Plus size={16} />
              {addingProject ? t("adding") : t("add")}
            </Button>
          </form>

          <div className="mt-4 grid gap-3">
            {user.projects?.length ? (
              user.projects.map((p) => (
                <div key={p.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      {p.link ? (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
                        >
                          {t("open")} <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </div>
                    <Button type="button" variant="secondary" onClick={() => onDeleteProject(p.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  {p.description ? <p className="mt-2 text-sm text-[var(--muted)]">{p.description}</p> : null}
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--muted)]">{t("noProjects")}</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle title={t("achievements")} subtitle={t("achievementsSubtitle")} />
        <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={onAddAchievement}>
          <div className="grid gap-3">
            <Input label={t("title")} value={achTitle} onChange={(e) => setAchTitle(e.target.value)} required />
            <Input
              label={t("date")}
              type="date"
              value={achDate}
              onChange={(e) => setAchDate(e.target.value)}
              required
            />
            <div className="text-xs text-[var(--muted)]">{t("dateHint")}</div>
          </div>
          <div className="grid gap-3">
            <Input
              label={t("certificate")}
              placeholder="https://..."
              value={achCert}
              onChange={(e) => setAchCert(e.target.value)}
            />
            <div className="flex items-end">
              <Button type="submit" disabled={addingAch} className="w-full">
                <Plus size={16} />
                {addingAch ? t("adding") : t("add")}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-4 grid gap-3">
          {user.achievements?.length ? (
            user.achievements.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{a.title}</div>
                  <div className="text-xs text-[var(--muted)]">{formatDate(a.date)}</div>
                  {a.certificateUrl ? (
                    <a
                      href={a.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
                    >
                      {t("certificate")} <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                <Button type="button" variant="secondary" onClick={() => onDeleteAchievement(a.id)}>
                  <Trash2 size={16} />
                </Button>
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

