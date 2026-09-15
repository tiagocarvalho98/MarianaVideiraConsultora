import { CalendarClock, FileText, MessageSquare, PhoneCall, RefreshCw, StickyNote, XCircle } from "lucide-react";
import { formatDateTime, formatStage } from "@/lib/crm/format";
import type { Activity, Profile } from "@/types/crm";

const activityMeta = {
  form_submission: { label: "Formulario", icon: FileText },
  stage_changed: { label: "Estado", icon: RefreshCw },
  call: { label: "Chamada", icon: PhoneCall },
  meeting: { label: "Reuniao", icon: CalendarClock },
  note: { label: "Nota", icon: StickyNote },
  task_created: { label: "Tarefa criada", icon: MessageSquare },
  task_completed: { label: "Tarefa concluida", icon: MessageSquare },
  lost: { label: "Perdido", icon: XCircle },
} as const;

function activityText(activity: Activity) {
  if (
    activity.type === "stage_changed" &&
    typeof activity.metadata.from === "string" &&
    typeof activity.metadata.to === "string"
  ) {
    return `Passou de ${formatStage(activity.metadata.from)} para ${formatStage(activity.metadata.to)}`;
  }

  if (activity.type === "lost" && typeof activity.metadata.reason === "string") {
    return `Motivo: ${formatStage(activity.metadata.reason)}`;
  }

  return activity.body ?? activity.title;
}

export function ActivityTimeline({
  activities,
  profiles,
}: {
  activities: Activity[];
  profiles: Profile[];
}) {
  if (activities.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-white p-5 text-sm text-stone-600">
        Sem atividades registadas.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-stone-950">Timeline</h2>
      <ol className="mt-5 space-y-4">
        {activities.map((activity) => {
          const meta = activityMeta[activity.type];
          const Icon = meta.icon;
          const author =
            profiles.find((profile) => profile.id === activity.userId)?.fullName ??
            "Sistema";

          return (
            <li key={activity.id} className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="rounded-xl border border-border bg-stone-50 p-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-stone-500">
                  <span>{meta.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateTime(activity.occurredAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{author}</span>
                </div>
                <p className="mt-2 text-sm text-stone-800">{activityText(activity)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
