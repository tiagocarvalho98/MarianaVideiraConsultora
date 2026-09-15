export type ConversionEventName =
  | "seller_form_view"
  | "seller_form_started"
  | "seller_lead_submitted"
  | "buyer_form_view"
  | "buyer_form_started"
  | "buyer_lead_submitted";

export type ConversionEvent = {
  name: ConversionEventName;
  occurredAt: string;
  metadata?: {
    path?: string;
  };
};

export function createConversionEvent(
  name: ConversionEventName,
  metadata?: ConversionEvent["metadata"],
): ConversionEvent {
  return {
    name,
    occurredAt: new Date().toISOString(),
    metadata,
  };
}

export function publishConversionEvent(event: ConversionEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ConversionEvent>("mariana:conversion", {
      detail: event,
    }),
  );
}
