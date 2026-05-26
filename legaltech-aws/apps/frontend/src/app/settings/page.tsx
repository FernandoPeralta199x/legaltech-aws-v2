"use client";

import {
  Bell,
  Building2,
  Lock,
  Moon,
  Palette,
  Save,
  Shield,
  User,
  Users
} from "lucide-react";
import { useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Card } from "@/components/Card";
import { PageTitle } from "@/components/PageTitle";
import { mockOrganizations, mockUsers } from "@/lib/mockData";

const TABS = [
  { id: "org", label: "Organização", icon: Building2 },
  { id: "members", label: "Membros", icon: Users },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "appearance", label: "Aparência", icon: Palette }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("org");
  const [saved, setSaved] = useState(false);

  const org = mockOrganizations[0];

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AuthGuard>
      <AppLayout>
        <PageTitle
          description="Gerencie as configurações da organização, membros e preferências da plataforma."
          eyebrow="Configurações"
          title="Configurações"
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar tabs */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:w-48 shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-brand-blue/15 text-brand-teal-dark"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <Icon size={14} className={active ? "text-brand-teal" : ""} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "org" && (
              <Card title="Dados da organização">
                <div className="space-y-4 max-w-lg">
                  <Field label="Nome da organização">
                    <input
                      className={inputClass}
                      defaultValue={org.name}
                      type="text"
                    />
                  </Field>
                  <Field label="CNPJ">
                    <input
                      className={`${inputClass} opacity-60 cursor-not-allowed`}
                      disabled
                      value={org.cnpj}
                    />
                  </Field>
                  <Field label="Plano">
                    <div className="flex items-center gap-3">
                      <input
                        className={`${inputClass} flex-1 opacity-60 cursor-not-allowed`}
                        disabled
                        value={org.plan.charAt(0).toUpperCase() + org.plan.slice(1)}
                      />
                      <button className="shrink-0 rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-3 py-2.5 text-xs font-semibold text-brand-teal-dark hover:bg-brand-blue/20 transition">
                        Upgrade
                      </button>
                    </div>
                  </Field>
                  <div className="pt-2">
                    <button
                      className={`flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue-dark transition ${
                        saved ? "bg-teal-600 shadow-glow-teal" : ""
                      }`}
                      onClick={handleSave}
                      type="button"
                    >
                      <Save size={14} />
                      {saved ? "Salvo!" : "Salvar alterações"}
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "members" && (
              <Card title="Membros da equipe" description="Gerencie quem tem acesso à plataforma.">
                <div className="divide-y divide-white/[0.06]">
                  {mockUsers.map((user) => (
                    <div className="flex items-center gap-4 py-4" key={user.id}>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                        {user.avatarInitials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-600">
                          {user.email}
                        </p>
                      </div>
                      <select className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 outline-none">
                        <option value="admin">Admin</option>
                        <option value="analyst">Analista</option>
                        <option value="client">Cliente</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 hover:border-brand-teal/30 hover:text-brand-teal-dark transition">
                    <User size={13} />
                    Convidar novo membro
                  </button>
                </div>
              </Card>
            )}

            {activeTab === "security" && (
              <div className="space-y-4">
                <Card title="Segurança da conta">
                  <div className="space-y-4 max-w-lg">
                    <Field label="Senha atual">
                      <input
                        className={inputClass}
                        placeholder="••••••••"
                        type="password"
                      />
                    </Field>
                    <Field label="Nova senha">
                      <input
                        className={inputClass}
                        placeholder="••••••••"
                        type="password"
                      />
                    </Field>
                    <Field label="Confirmar nova senha">
                      <input
                        className={inputClass}
                        placeholder="••••••••"
                        type="password"
                      />
                    </Field>
                    <button className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue-dark transition">
                      <Lock size={14} />
                      Atualizar senha
                    </button>
                  </div>
                </Card>

                <Card title="Sessões ativas" description="Dispositivos com acesso à conta.">
                  {[
                    { device: "Windows — Chrome", location: "São Paulo, SP", current: true },
                    { device: "macOS — Safari", location: "Rio de Janeiro, RJ", current: false }
                  ].map((s) => (
                    <div
                      className="flex items-center justify-between border-t border-slate-200 py-3 first:border-0 first:pt-0"
                      key={s.device}
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-800">{s.device}</p>
                        <p className="text-[11px] text-slate-500">{s.location}</p>
                      </div>
                      {s.current ? (
                        <span className="text-[10px] font-semibold text-teal-400">
                          Sessão atual
                        </span>
                      ) : (
                        <button className="text-[10px] font-semibold text-red-700 hover:text-red-700 transition">
                          Encerrar
                        </button>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {activeTab === "notifications" && (
              <Card title="Preferências de notificação">
                <div className="space-y-4">
                  {[
                    { label: "Novo caso criado", desc: "Quando um caso é adicionado à sua organização" },
                    { label: "Análise concluída", desc: "Quando a IA finaliza o processamento de um caso" },
                    { label: "Revisão pendente", desc: "Quando um relatório aguarda aprovação" },
                    { label: "Relatório aprovado", desc: "Quando um relatório é liberado para o cliente" },
                    { label: "Falha em agente", desc: "Quando um agente de IA encontra um erro" }
                  ].map((n) => (
                    <div
                      className="flex items-center justify-between gap-4"
                      key={n.label}
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-800">{n.label}</p>
                        <p className="text-[11px] text-slate-500">{n.desc}</p>
                      </div>
                      <label className="relative flex h-5 w-9 cursor-pointer items-center">
                        <input
                          className="peer sr-only"
                          defaultChecked
                          type="checkbox"
                        />
                        <div className="h-5 w-9 rounded-full bg-slate-200 transition peer-checked:bg-brand-teal" />
                        <div className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card title="Aparência">
                <div className="space-y-6">
                  <div>
                    <p className="mb-3 text-xs font-medium text-slate-600">Tema</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { id: "dark", label: "Escuro", desc: "Tema padrão da plataforma", active: true },
                        { id: "light", label: "Claro", desc: "Em desenvolvimento", active: false }
                      ].map((t) => (
                        <button
                          className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
                            t.active
                              ? "border-brand-teal/40 bg-brand-teal/10"
                              : "border-slate-200 bg-white opacity-50 cursor-not-allowed"
                          }`}
                          disabled={!t.active}
                          key={t.id}
                          type="button"
                        >
                          <Moon size={18} className={t.active ? "text-brand-teal-dark" : "text-slate-500"} />
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{t.label}</p>
                            <p className="text-[11px] text-slate-500">{t.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder:text-slate-500 outline-none transition focus:border-brand-teal/40 focus:bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
