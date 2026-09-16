"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { submitBuyerLeadAction, submitSellerLeadAction } from "@/app/public-actions";
import {
  budgetOptions,
  buyingTimeframeOptions,
  contactTopicOptions,
  financingStatusOptions,
  listedOptions,
  propertyTypeOptions,
  sellerSituationOptions,
  sellingTimeframeOptions,
  typologyOptions,
  yesNoOptions,
} from "@/data/form-options";
import {
  buyerFormSchema,
  contactFormSchema,
  sellerFormSchema,
} from "@/lib/public/form-validation";
import {
  createConversionEvent,
  publishConversionEvent,
  type ConversionEventName,
} from "@/lib/analytics/conversion-events";

type FormErrors = Record<string, string>;
type StoredAttribution = Partial<Record<
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_content"
  | "utm_term"
  | "gclid"
  | "fbclid"
  | "referrer",
  string
>>;

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (value === "on") return true;
  return typeof value === "string" ? value : "";
}

function collectData(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, fieldValue(formData, key)]));
}

function useTrackingFields() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(
    () => {
      const keys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "gclid",
        "fbclid",
      ] as const;
      const stored = readStoredAttribution();
      const nextStored = { ...stored };
      let hasNewAttribution = false;

      keys.forEach((key) => {
        const value = searchParams.get(key);
        if (value) {
          nextStored[key] = value;
          hasNewAttribution = true;
        }
      });

      if (
        typeof document !== "undefined" &&
        document.referrer &&
        !nextStored.referrer
      ) {
        nextStored.referrer = document.referrer;
        hasNewAttribution = true;
      }

      if (hasNewAttribution && typeof window !== "undefined") {
        window.sessionStorage.setItem("mariana_attribution", JSON.stringify(nextStored));
      }

      return {
        utmSource: searchParams.get("utm_source") ?? nextStored.utm_source ?? "",
        utmMedium: searchParams.get("utm_medium") ?? nextStored.utm_medium ?? "",
        utmCampaign: searchParams.get("utm_campaign") ?? nextStored.utm_campaign ?? "",
        utmContent: searchParams.get("utm_content") ?? nextStored.utm_content ?? "",
        utmTerm: searchParams.get("utm_term") ?? nextStored.utm_term ?? "",
        gclid: searchParams.get("gclid") ?? nextStored.gclid ?? "",
        fbclid: searchParams.get("fbclid") ?? nextStored.fbclid ?? "",
        landingPage: pathname,
        referrer:
          typeof document === "undefined"
            ? ""
            : document.referrer || nextStored.referrer || "",
      };
    },
    [pathname, searchParams],
  );
}

function readStoredAttribution(): StoredAttribution {
  if (typeof window === "undefined") return {};

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem("mariana_attribution") ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

function HoneypotField() {
  return (
    <div className="sr-only" aria-hidden="true">
      <label>
        Website da empresa
        <input
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
}

function useFormConversionEvents({
  view,
  started,
  submitted,
}: {
  view: ConversionEventName;
  started: ConversionEventName;
  submitted: ConversionEventName;
}) {
  const pathname = usePathname();
  const startedRef = useRef(false);

  useEffect(() => {
    publishConversionEvent(createConversionEvent(view, { path: pathname }));
  }, [pathname, view]);

  return {
    markStarted() {
      if (startedRef.current) return;
      startedRef.current = true;
      publishConversionEvent(createConversionEvent(started, { path: pathname }));
    },
    markSubmitted() {
      publishConversionEvent(createConversionEvent(submitted, { path: pathname }));
    },
  };
}

function HiddenTrackingFields() {
  const tracking = useTrackingFields();

  return (
    <>
      {Object.entries(tracking).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </>
  );
}

function FieldError({ error }: { error?: string }) {
  return error ? (
    <p className="text-sm font-semibold text-red-700" role="alert">
      {error}
    </p>
  ) : null;
}

function TextInput({
  label,
  name,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "tel";
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        className="min-h-12 border border-primary/24 bg-foreground px-3 text-base text-background outline-none transition focus:border-primary"
      />
      <FieldError error={error} />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        name={name}
        required
        defaultValue=""
        aria-invalid={Boolean(error)}
        className="min-h-12 border border-primary/24 bg-foreground px-3 text-base text-background outline-none transition focus:border-primary"
      >
        <option value="" disabled>
          Escolher
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError error={error} />
    </label>
  );
}

function TextArea({
  label,
  name,
  error,
}: {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground md:col-span-2">
      {label}
      <textarea
        name={name}
        rows={4}
        aria-invalid={Boolean(error)}
        className="border border-primary/24 bg-foreground px-3 py-3 text-base text-background outline-none transition focus:border-primary"
      />
      <FieldError error={error} />
    </label>
  );
}

function SubmitSuccess() {
  return (
    <div className="border border-primary/25 bg-primary/10 p-4 text-sm font-semibold text-primary">
      <span className="inline-flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Pedido recebido. A informacao ficou registada para acompanhamento.
      </span>
    </div>
  );
}

function ContactValidationSuccess() {
  return (
    <div className="border border-primary/25 bg-primary/10 p-4 text-sm font-semibold text-primary">
      Dados validados nesta pagina. Para registo no CRM, use os formularios de venda ou compra.
    </div>
  );
}

export function SellerLeadForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const conversion = useFormConversionEvents({
    view: "seller_form_view",
    started: "seller_form_started",
    submitted: "seller_lead_submitted",
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = sellerFormSchema.safeParse(
      collectData(formData, [
        "name",
        "phone",
        "email",
        "propertyLocation",
        "propertyType",
        "currentSituation",
        "sellingTimeframe",
        "alreadyListed",
        "message",
        "privacyConsent",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "utmContent",
        "utmTerm",
        "landingPage",
        "referrer",
        "gclid",
        "fbclid",
      ]),
    );

    if (!result.success) {
      setSuccess(false);
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const actionResult = await submitSellerLeadAction(formData).catch(() => ({
      ok: false,
      errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." },
    }));
    setIsSubmitting(false);

    if (!actionResult.ok) {
      setSuccess(false);
      setErrors(actionResult.errors ?? {});
      return;
    }

    setSuccess(true);
    conversion.markSubmitted();
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} onChange={conversion.markStarted} className="grid gap-4 border border-primary/24 bg-surface p-5 md:grid-cols-2">
      <HiddenTrackingFields />
      <HoneypotField />
      <TextInput label="Nome" name="name" required error={errors.name} />
      <TextInput label="Telefone" name="phone" type="tel" required error={errors.phone} />
      <TextInput label="Email opcional" name="email" type="email" error={errors.email} />
      <TextInput label="Localizacao do imovel" name="propertyLocation" required error={errors.propertyLocation} />
      <SelectField label="Tipo de imovel" name="propertyType" options={propertyTypeOptions} error={errors.propertyType} />
      <SelectField label="Situacao atual" name="currentSituation" options={sellerSituationOptions} error={errors.currentSituation} />
      <SelectField label="Prazo aproximado para vender" name="sellingTimeframe" options={sellingTimeframeOptions} error={errors.sellingTimeframe} />
      <SelectField label="Ja esta anunciado?" name="alreadyListed" options={listedOptions} error={errors.alreadyListed} />
      <TextArea label="Mensagem opcional" name="message" error={errors.message} />
      <label className="flex gap-3 text-sm font-semibold text-foreground/82 md:col-span-2">
        <input name="privacyConsent" type="checkbox" className="mt-1 h-5 w-5 border-border accent-primary" />
        <span>Aceito a politica de privacidade e autorizo o tratamento dos dados para resposta ao meu pedido.</span>
      </label>
      <FieldError error={errors.privacyConsent} />
      <FieldError error={errors.form} />
      {success ? <div className="md:col-span-2"><SubmitSuccess /></div> : null}
      <button disabled={isSubmitting} className="min-h-12 border border-primary bg-primary px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
        {isSubmitting ? "A enviar" : "Enviar pedido de contacto"}
      </button>
    </form>
  );
}

export function BuyerLeadForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const conversion = useFormConversionEvents({
    view: "buyer_form_view",
    started: "buyer_form_started",
    submitted: "buyer_lead_submitted",
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = buyerFormSchema.safeParse(
      collectData(formData, [
        "name",
        "phone",
        "email",
        "desiredZones",
        "typology",
        "budget",
        "financingStatus",
        "buyingTimeframe",
        "hasPropertyToSell",
        "message",
        "privacyConsent",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "utmContent",
        "utmTerm",
        "landingPage",
        "referrer",
        "gclid",
        "fbclid",
      ]),
    );

    if (!result.success) {
      setSuccess(false);
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const actionResult = await submitBuyerLeadAction(formData).catch(() => ({
      ok: false,
      errors: { form: "Nao foi possivel enviar o pedido. Tente novamente dentro de instantes." },
    }));
    setIsSubmitting(false);

    if (!actionResult.ok) {
      setSuccess(false);
      setErrors(actionResult.errors ?? {});
      return;
    }

    setSuccess(true);
    conversion.markSubmitted();
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} onChange={conversion.markStarted} className="grid gap-4 border border-primary/24 bg-surface p-5 md:grid-cols-2">
      <HiddenTrackingFields />
      <HoneypotField />
      <TextInput label="Nome" name="name" required error={errors.name} />
      <TextInput label="Telefone" name="phone" type="tel" required error={errors.phone} />
      <TextInput label="Email opcional" name="email" type="email" error={errors.email} />
      <TextInput label="Zonas pretendidas" name="desiredZones" required error={errors.desiredZones} />
      <SelectField label="Tipologia" name="typology" options={typologyOptions} error={errors.typology} />
      <SelectField label="Orcamento" name="budget" options={budgetOptions} error={errors.budget} />
      <SelectField label="Situacao de financiamento" name="financingStatus" options={financingStatusOptions} error={errors.financingStatus} />
      <SelectField label="Prazo para comprar" name="buyingTimeframe" options={buyingTimeframeOptions} error={errors.buyingTimeframe} />
      <SelectField label="Tem imovel para vender?" name="hasPropertyToSell" options={yesNoOptions} error={errors.hasPropertyToSell} />
      <TextArea label="Mensagem opcional" name="message" error={errors.message} />
      <label className="flex gap-3 text-sm font-semibold text-foreground/82 md:col-span-2">
        <input name="privacyConsent" type="checkbox" className="mt-1 h-5 w-5 border-border accent-primary" />
        <span>Aceito a politica de privacidade e autorizo o tratamento dos dados para resposta ao meu pedido.</span>
      </label>
      <FieldError error={errors.privacyConsent} />
      <FieldError error={errors.form} />
      {success ? <div className="md:col-span-2"><SubmitSuccess /></div> : null}
      <button disabled={isSubmitting} className="min-h-12 border border-primary bg-primary px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
        {isSubmitting ? "A enviar" : "Enviar pedido de acompanhamento"}
      </button>
    </form>
  );
}

export function ContactForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = contactFormSchema.safeParse(
      collectData(formData, [
        "name",
        "phone",
        "email",
        "topic",
        "message",
        "privacyConsent",
        "utmSource",
        "utmMedium",
        "utmCampaign",
        "utmContent",
        "utmTerm",
        "landingPage",
        "referrer",
        "gclid",
        "fbclid",
      ]),
    );

    if (!result.success) {
      setSuccess(false);
      setErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }

    setErrors({});
    setSuccess(true);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 border border-primary/24 bg-surface p-5 md:grid-cols-2">
      <HiddenTrackingFields />
      <TextInput label="Nome" name="name" required error={errors.name} />
      <TextInput label="Telefone" name="phone" type="tel" required error={errors.phone} />
      <TextInput label="Email opcional" name="email" type="email" error={errors.email} />
      <SelectField label="Tema" name="topic" options={contactTopicOptions} error={errors.topic} />
      <TextArea label="Mensagem" name="message" error={errors.message} />
      <label className="flex gap-3 text-sm font-semibold text-foreground/82 md:col-span-2">
        <input name="privacyConsent" type="checkbox" className="mt-1 h-5 w-5 border-border accent-primary" />
        <span>Aceito a politica de privacidade e autorizo o tratamento dos dados para resposta ao meu pedido.</span>
      </label>
      <FieldError error={errors.privacyConsent} />
      {success ? <div className="md:col-span-2"><ContactValidationSuccess /></div> : null}
      <button className="min-h-12 border border-primary bg-primary px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent md:col-span-2">
        Validar dados
      </button>
    </form>
  );
}
