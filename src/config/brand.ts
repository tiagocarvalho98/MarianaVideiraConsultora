import { getSiteUrl } from "./site";

export const brand = {
  name: "Mariana",
  surname: "Videira",
  fullName: "Mariana Videira",
  role: "Consultora Imobiliaria",
  tagline: "Confie o que mais valoriza a quem sabe cuidar.",
  phone: "[telefone por confirmar]",
  email: "[email por confirmar]",
  whatsapp: "[whatsapp por confirmar]",
  instagram: "[instagram por confirmar]",
  siteUrl: getSiteUrl(),
  company: "[empresa por confirmar]",
  network: "[rede imobiliaria por confirmar]",
  profileImage: "/placeholders/mariana-profile-placeholder.svg",
  serviceAreas: ["Montijo", "Alcochete", "Setubal", "Palmela", "Barreiro", "Moita"],
  socials: {
    instagram: "[instagram por confirmar]",
  },
} as const;

export const publicNavItems = [
  { href: "/", label: "Inicio" },
  { href: "/vender", label: "Vender" },
  { href: "/comprar", label: "Comprar" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contacto", label: "Contacto" },
] as const;
