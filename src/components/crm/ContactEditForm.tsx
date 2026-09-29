import { updateContactAction } from "@/app/crm/actions";
import type { Contact } from "@/types/crm";

type ContactEditFormProps = {
  contact: Contact;
};

export function ContactEditForm({ contact }: ContactEditFormProps) {
  return (
    <form action={updateContactAction} className="crm-card rounded-3xl p-5">
      <input type="hidden" name="contactId" value={contact.id} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">
            Contacto
          </p>
          <h2 className="mt-1 text-lg font-bold text-stone-50">Editar dados</h2>
        </div>
        <button className="min-h-11 rounded-xl bg-accent px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary">
          Guardar contacto
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold text-stone-300">
          Nome
          <input
            required
            name="firstName"
            defaultValue={contact.firstName}
            className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-300">
          Apelido
          <input
            name="lastName"
            defaultValue={contact.lastName ?? ""}
            className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-300">
          Telefone
          <input
            required
            name="phone"
            type="tel"
            defaultValue={contact.phone}
            className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-stone-300">
          Email
          <input
            name="email"
            type="email"
            defaultValue={contact.email ?? ""}
            className="min-h-11 rounded-xl border border-accent/20 bg-[#061a2b] px-3 text-sm text-stone-100"
          />
        </label>
      </div>
    </form>
  );
}
