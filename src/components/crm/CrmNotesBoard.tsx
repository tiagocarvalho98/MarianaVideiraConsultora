"use client";

import { useMemo, useState } from "react";
import { Plus, StickyNote, UsersRound } from "lucide-react";
import {
  createCrmNoteAction,
  createNoteTeamAction,
  updateCrmNoteAction,
} from "@/app/crm/actions";
import { noteCategories, noteCategoryMeta } from "@/data/note-categories";
import { cn } from "@/lib/utils";
import type { CrmNote, NoteTeam, NoteTeamMember, Profile } from "@/types/crm";

type CrmNotesBoardProps = {
  notes: CrmNote[];
  teams: NoteTeam[];
  teamMembers: NoteTeamMember[];
  profiles: Profile[];
  currentProfileId: string;
  opportunityId?: string;
  contactId?: string;
  compact?: boolean;
};

function profileName(profiles: Profile[], id: string) {
  return profiles.find((profile) => profile.id === id)?.fullName ?? "Utilizador";
}

export function CrmNotesBoard({
  notes,
  teams,
  teamMembers,
  profiles,
  currentProfileId,
  opportunityId,
  contactId,
  compact = false,
}: CrmNotesBoardProps) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? null;
  const visibleTeams = useMemo(
    () =>
      teams.map((team) => ({
        ...team,
        members: teamMembers.filter((member) => member.teamId === team.id),
      })),
    [teamMembers, teams],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <section className="crm-surface rounded-3xl p-5">
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Notas
            </p>
            <h2 className="mt-1 text-2xl font-bold text-stone-50">
              Painel de notas comerciais
            </h2>
            <p className="mt-1 text-sm text-stone-400">
              Usuario → equipa → notas partilhadas, com prioridade visual clara.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 px-3 py-1.5 text-sm font-bold text-accent">
            <StickyNote className="h-4 w-4" aria-hidden="true" />
            {notes.length}
          </span>
        </div>

        <div className={cn("relative mt-5 grid gap-4", compact ? "lg:grid-cols-2" : "2xl:grid-cols-4 lg:grid-cols-2")}>
          {noteCategories.map((category) => {
            const categoryNotes = notes.filter((note) => note.category === category.id);

            return (
              <div key={category.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-100">{category.label}</h3>
                    <p className="text-xs text-stone-500">{category.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs font-bold text-stone-300">
                    {categoryNotes.length}
                  </span>
                </div>
                <div className="mt-3 grid gap-3">
                  {categoryNotes.map((note) => {
                    const meta = noteCategoryMeta(note.category);
                    const selected = selectedNote?.id === note.id;

                    return (
                      <button
                        key={note.id}
                        type="button"
                        onClick={() => setSelectedNoteId(note.id)}
                        className={cn(
                          "min-h-32 rotate-[-0.5deg] rounded-xl border p-4 text-left shadow-lg transition hover:-translate-y-0.5 hover:rotate-0",
                          meta.className,
                          selected && "ring-2 ring-accent",
                        )}
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">
                          {note.ownerProfile?.fullName ?? "Nota"}
                        </p>
                        <h4 className="mt-2 line-clamp-2 text-base font-black">
                          {note.title ?? "Sem titulo"}
                        </h4>
                        <p className="mt-2 line-clamp-4 text-sm leading-5">{note.body}</p>
                        {note.sharedTeams.length ? (
                          <p className="mt-3 text-xs font-bold">
                            Partilhada: {note.sharedTeams.map((team) => team.name).join(", ")}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
                  {categoryNotes.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-accent/20 p-4 text-sm text-stone-500">
                      Sem notas nesta categoria.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="crm-card rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="text-lg font-bold text-stone-50">
              {selectedNote ? "Editar nota" : "Nova nota"}
            </h3>
          </div>
          <form
            key={selectedNote?.id ?? "new-note"}
            action={selectedNote ? updateCrmNoteAction : createCrmNoteAction}
            className="mt-4 grid gap-3"
          >
            {selectedNote ? <input type="hidden" name="noteId" value={selectedNote.id} /> : null}
            {opportunityId ? <input type="hidden" name="opportunityId" value={opportunityId} /> : null}
            {contactId ? <input type="hidden" name="contactId" value={contactId} /> : null}
            <label className="grid gap-1 text-sm font-semibold text-stone-300">
              Titulo
              <input
                name="title"
                defaultValue={selectedNote?.title ?? ""}
                className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-stone-300">
              Nota
              <textarea
                required
                name="body"
                rows={5}
                defaultValue={selectedNote?.body ?? ""}
                className="rounded-xl border border-accent/20 bg-[#061a2b] px-3 py-2 text-sm text-stone-100"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-stone-300">
              Categoria
              <select
                name="category"
                defaultValue={selectedNote?.category ?? "warm"}
                className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
              >
                {noteCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="rounded-2xl border border-white/10 p-3">
              <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Partilhar com equipas
              </legend>
              <div className="mt-2 grid gap-2">
                {visibleTeams.map((team) => (
                  <label key={team.id} className="flex gap-3 rounded-xl bg-white/[0.035] p-3 text-sm text-stone-200">
                    <input
                      type="checkbox"
                      name="teamIds"
                      value={team.id}
                      defaultChecked={Boolean(selectedNote?.sharedTeams.some((shared) => shared.id === team.id))}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <strong>{team.name}</strong>
                      <span className="mt-1 block text-xs text-stone-500">
                        {team.members.map((member) => profileName(profiles, member.userId)).join(", ")}
                      </span>
                    </span>
                  </label>
                ))}
                {visibleTeams.length === 0 ? (
                  <p className="text-sm text-stone-500">Cria uma equipa para partilhar notas.</p>
                ) : null}
              </div>
            </fieldset>
            {selectedNote ? (
              <label className="flex items-center gap-2 text-sm font-semibold text-stone-300">
                <input type="checkbox" name="archive" />
                Arquivar nota
              </label>
            ) : null}
            <div className="flex gap-2">
              <button className="min-h-11 flex-1 rounded-xl bg-accent px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary">
                {selectedNote ? "Guardar nota" : "Criar nota"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedNoteId(null)}
                className="min-h-11 rounded-xl border border-accent/25 px-4 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent"
              >
                Nova
              </button>
            </div>
          </form>
        </section>

        <section className="crm-card rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="text-lg font-bold text-stone-50">Criar equipa</h3>
          </div>
          <form action={createNoteTeamAction} className="mt-4 grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-stone-300">
              Nome da equipa
              <input
                required
                name="name"
                placeholder="Ex: Equipa Montijo"
                className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
              />
            </label>
            <fieldset className="rounded-2xl border border-white/10 p-3">
              <legend className="px-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Membros
              </legend>
              <div className="mt-2 grid gap-2">
                {profiles
                  .filter((profile) => profile.id !== currentProfileId)
                  .map((profile) => (
                    <label key={profile.id} className="flex items-center gap-2 text-sm text-stone-300">
                      <input type="checkbox" name="memberIds" value={profile.id} />
                      {profile.fullName}
                    </label>
                  ))}
              </div>
            </fieldset>
            <button className="min-h-11 rounded-xl border border-accent/25 px-4 text-sm font-bold text-stone-100 transition hover:border-accent hover:text-accent">
              Criar equipa
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
