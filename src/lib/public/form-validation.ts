import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .max(32, "Telefone demasiado longo.")
  .min(9, "Indique um telefone valido para contacto.")
  .regex(/^[+0-9\s()-]+$/, "Use apenas numeros, espacos e indicativo.");

const emailOptionalSchema = z
  .string()
  .trim()
  .max(254, "Email demasiado longo.")
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().email("Indique um email valido.").optional());

const consentSchema = z.literal(true, {
  errorMap: () => ({ message: "E necessario aceitar a politica de privacidade." }),
});

const trackingSchema = {
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(180).optional(),
  utmContent: z.string().max(180).optional(),
  utmTerm: z.string().max(180).optional(),
  landingPage: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  gclid: z.string().max(250).optional(),
  fbclid: z.string().max(250).optional(),
};

export const sellerFormSchema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome.").max(120, "Nome demasiado longo."),
  phone: phoneSchema,
  email: emailOptionalSchema,
  propertyLocation: z.string().trim().min(2, "Indique a localizacao do imovel.").max(180),
  propertyType: z.string().trim().min(1, "Escolha o tipo de imovel.").max(80),
  currentSituation: z.string().trim().min(1, "Escolha a situacao atual.").max(120),
  sellingTimeframe: z.string().trim().min(1, "Escolha o prazo aproximado.").max(120),
  alreadyListed: z.string().trim().min(1, "Indique se o imovel ja esta anunciado.").max(80),
  message: z.string().max(2000, "Mensagem demasiado longa.").optional(),
  privacyConsent: consentSchema,
  ...trackingSchema,
}).strict();

export const buyerFormSchema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome.").max(120, "Nome demasiado longo."),
  phone: phoneSchema,
  email: emailOptionalSchema,
  desiredZones: z.string().trim().min(2, "Indique pelo menos uma zona pretendida.").max(180),
  typology: z.string().trim().min(1, "Escolha uma tipologia.").max(80),
  budget: z.string().trim().min(1, "Indique o seu intervalo de orcamento.").max(120),
  financingStatus: z.string().trim().min(1, "Escolha a situacao de financiamento.").max(120),
  buyingTimeframe: z.string().trim().min(1, "Escolha o prazo para comprar.").max(120),
  hasPropertyToSell: z.string().trim().min(1, "Indique se tem imovel para vender.").max(80),
  message: z.string().max(2000, "Mensagem demasiado longa.").optional(),
  privacyConsent: consentSchema,
  ...trackingSchema,
}).strict();

export type SellerFormData = z.infer<typeof sellerFormSchema>;
export type BuyerFormData = z.infer<typeof buyerFormSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Indique o seu nome.").max(120),
  phone: phoneSchema,
  email: emailOptionalSchema,
  topic: z.string().trim().min(1, "Escolha o tema do contacto.").max(120),
  message: z.string().trim().min(4, "Escreva uma mensagem breve.").max(2000),
  privacyConsent: consentSchema,
  ...trackingSchema,
}).strict();

export type ContactFormData = z.infer<typeof contactFormSchema>;
