"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, X } from "lucide-react";
import {
  createManualOpportunityAction,
  type ManualOpportunityActionState,
} from "@/app/crm/actions";
import {
  findExistingManualContact,
  manualTaskTypes,
  type ManualOpportunityContactPreview,
} from "@/lib/crm/manual-opportunity";
import {
  buyingTimeframeOptions,
  financingStatusOptions,
  listedOptions,
  propertyTypeOptions,
  sellerSituationOptions,
  sellingTimeframeOptions,
  typologyOptions,
  yesNoOptions,
} from "@/data/form-options";
import { leadTemperatures } from "@/data/temperatures";
import type { Contact, LeadSource, OpportunityType, Profile } from "@/types/crm";

type ManualOpportunityDialogProps = {
  profiles: Profile[];
  sources: LeadSource[];
  contacts: ManualOpportunityContactPreview[];
  currentProfileId: string;
  preselectedContact?: Contact;
  buttonLabel?: string;
};

const initialState: ManualOpportunityActionState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "A criar..." : "Criar oportunidade"}
    </button>
  );
}

function OptionList({ values }: { values: readonly string[] }) {
  return (
    <>
      <option value="">Selecionar</option>
      {values.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </>
  );
}

export function ManualOpportunityDialog({
  profiles,
  sources,
  contacts,
  currentProfileId,
  preselectedContact,
  buttonLabel = "Nova oportunidade",
}: ManualOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<OpportunityType>("buyer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hasNextTask, setHasNextTask] = useState(false);
  const [state, action] = useActionState(createManualOpportunityAction, initialState);
  const activeProfiles = profiles.filter(
    (profile) => profile.isActive && (profile.role === "admin" || profile.role === "consultor"),
  );
  const existingContact = useMemo(
    () =>
      preselectedContact
        ? null
        : findExistingManualContact(contacts, {
            phone,
            email,
          }),
    [contacts, email, phone, preselectedContact],
  );
  const effectiveContactId = preselectedContact?.id ?? existingContact?.id ?? "";
  const defaultSourceId =
    sources.find((source) => source.name === "Chamada")?.id ?? sources[0]?.id ?? "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-stone-900"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {buttonLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-stone-950/55 p-0 backdrop-blur-sm sm:p-4">
          <div className="ml-auto flex h-dvh w-full max-w-5xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  CRM
                </p>
                <h2 className="mt-1 text-2xl font-bold text-stone-950">
                  Nova oportunidade
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-stone-600 transition hover:border-primary hover:text-primary"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form action={action} className="flex-1 overflow-y-auto px-5 py-5">
              <input type="hidden" name="contactId" value={effectiveContactId} />

              {state.error ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {state.error}
                </div>
              ) : null}

              <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-2xl border border-border p-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">
                    Contacto
                  </h3>

                  {preselectedContact ? (
                    <div className="mt-4 rounded-xl bg-stone-50 p-4 text-sm">
                      <p className="font-bold text-stone-950">
                        {preselectedContact.firstName} {preselectedContact.lastName ?? ""}
                      </p>
                      <p className="mt-1 text-stone-600">{preselectedContact.phone}</p>
                      <p className="text-stone-600">{preselectedContact.email ?? "Sem email"}</p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3">
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Nome *
                        <input
                          name="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          className="min-h-11 rounded-xl border border-border px-3"
                          required
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Telefone *
                        <input
                          name="phone"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          className="min-h-11 rounded-xl border border-border px-3"
                          required
                        />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Email opcional
                        <input
                          name="email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="min-h-11 rounded-xl border border-border px-3"
                        />
                      </label>

                      {existingContact ? (
                        <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 text-sm text-stone-700">
                          <p className="font-bold text-stone-950">
                            Ja existe um contacto com este telefone/email.
                          </p>
                          <p className="mt-1">
                            {existingContact.firstName} {existingContact.lastName ?? ""} ·{" "}
                            {existingContact.phone}
                          </p>
                          <p className="font-bold text-primary">
                            Sera criada uma nova oportunidade para este contacto.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-border p-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">
                    Oportunidade
                  </h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="grid gap-1 text-sm font-semibold text-stone-700">
                      Tipo *
                      <select
                        name="type"
                        value={type}
                        onChange={(event) => setType(event.target.value as OpportunityType)}
                        className="min-h-11 rounded-xl border border-border px-3"
                      >
                        <option value="buyer">Comprador</option>
                        <option value="seller">Vendedor</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-stone-700">
                      Origem *
                      <select
                        name="sourceId"
                        defaultValue={defaultSourceId}
                        className="min-h-11 rounded-xl border border-border px-3"
                        required
                      >
                        {sources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-stone-700">
                      Temperatura
                      <select
                        name="temperature"
                        defaultValue="morna"
                        className="min-h-11 rounded-xl border border-border px-3"
                      >
                        {leadTemperatures.map((temperature) => (
                          <option key={temperature.id} value={temperature.id}>
                            {temperature.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm font-semibold text-stone-700">
                      Responsavel
                      <select
                        name="assignedTo"
                        defaultValue={currentProfileId}
                        className="min-h-11 rounded-xl border border-border px-3"
                      >
                        {activeProfiles.map((profile) => (
                          <option key={profile.id} value={profile.id}>
                            {profile.fullName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section className="rounded-2xl border border-border p-4 xl:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">
                    Detalhes
                  </h3>

                  {type === "seller" ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Localizacao do imovel
                        <input name="location" className="min-h-11 rounded-xl border border-border px-3" />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Tipo de imovel
                        <select name="propertyType" className="min-h-11 rounded-xl border border-border px-3">
                          <OptionList values={propertyTypeOptions} />
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Situacao atual
                        <select name="sellerSituation" className="min-h-11 rounded-xl border border-border px-3">
                          <OptionList values={sellerSituationOptions} />
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Prazo aproximado
                        <select name="timeframe" className="min-h-11 rounded-xl border border-border px-3">
                          <OptionList values={sellingTimeframeOptions} />
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Ja esta anunciado?
                        <select name="propertyAlreadyListed" className="min-h-11 rounded-xl border border-border px-3">
                          <option value="">Selecionar</option>
                          {listedOptions.map((option) => (
                            <option key={option} value={option === "Sim" ? "true" : option === "Nao" ? "false" : ""}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Zonas pretendidas
                        <input name="location" className="min-h-11 rounded-xl border border-border px-3" />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Tipologia
                        <select name="propertyType" className="min-h-11 rounded-xl border border-border px-3">
                          <OptionList values={typologyOptions} />
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Orcamento minimo
                        <input name="budgetMin" type="number" min="0" className="min-h-11 rounded-xl border border-border px-3" />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Orcamento maximo
                        <input name="budgetMax" type="number" min="0" className="min-h-11 rounded-xl border border-border px-3" />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Situacao de financiamento
                        <select name="financingStatus" className="min-h-11 rounded-xl border border-border px-3">
                          <OptionList values={financingStatusOptions} />
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Prazo aproximado
                        <select name="timeframe" className="min-h-11 rounded-xl border border-border px-3">
                          <OptionList values={buyingTimeframeOptions} />
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Tem imovel para vender?
                        <select name="currentPropertyToSell" className="min-h-11 rounded-xl border border-border px-3">
                          <option value="">Selecionar</option>
                          {yesNoOptions.map((option) => (
                            <option key={option} value={option === "Sim" ? "true" : option === "Nao" ? "false" : ""}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-border p-4">
                  <label className="flex items-center gap-3 text-sm font-bold text-stone-800">
                    <input
                      type="checkbox"
                      name="hasNextTask"
                      checked={hasNextTask}
                      onChange={(event) => setHasNextTask(event.target.checked)}
                      className="h-5 w-5 rounded border-border"
                    />
                    Definir proxima acao agora
                  </label>

                  {hasNextTask ? (
                    <div className="mt-4 grid gap-3">
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Tipo
                        <select name="nextTaskType" className="min-h-11 rounded-xl border border-border px-3">
                          {manualTaskTypes.map((taskType) => (
                            <option key={taskType.id} value={taskType.id}>
                              {taskType.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Data/hora *
                        <input name="nextTaskDueAt" type="datetime-local" className="min-h-11 rounded-xl border border-border px-3" />
                      </label>
                      <label className="grid gap-1 text-sm font-semibold text-stone-700">
                        Descricao curta *
                        <input name="nextTaskTitle" className="min-h-11 rounded-xl border border-border px-3" />
                      </label>
                    </div>
                  ) : null}
                </section>

                <section className="rounded-2xl border border-border p-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">
                    Notas
                  </h3>
                  <label className="mt-4 grid gap-1 text-sm font-semibold text-stone-700">
                    Nota inicial opcional
                    <textarea
                      name="note"
                      rows={6}
                      className="rounded-xl border border-border px-3 py-2"
                    />
                  </label>
                </section>
              </div>

              <div className="sticky bottom-0 mt-5 flex flex-col gap-3 border-t border-border bg-white py-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-bold text-stone-700 transition hover:border-primary hover:text-primary"
                >
                  Cancelar
                </button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
