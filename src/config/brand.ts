/** Número WhatsApp: país + DDD + número (sem + ou espaços) */
export const WHATSAPP_E164 = import.meta.env.VITE_WHATSAPP ?? '5538999845134'

export const BRAND = {
  name: 'DH Multiprodutos',
  claim: 'A sua maior loja com diversas variedades e melhores preços',
  heroLead:
    'Pods descartáveis premium no precinho. A maior distribuidora de pods de Unaí, com tudo 100% original e o menor preço.',
  deliveryLine: 'Unaí — MG',
  instagram: {
    store: 'dh_multiprodutosunai',
    dev: 'realkauex',
  },
} as const

export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

export function instagramProfileUrl(username: string): string {
  const u = username.replace(/^@/, '')
  return `https://www.instagram.com/${u}/`
}

export function whatsappUrlWithText(text: string): string {
  const q = encodeURIComponent(text)
  return `https://wa.me/${WHATSAPP_E164}?text=${q}`
}
