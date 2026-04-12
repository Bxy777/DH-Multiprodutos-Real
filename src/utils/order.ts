import { BRAND, whatsappUrlWithText } from '../config/brand'
import type { CartLine, PaymentMethod } from '../types'
import { formatBRL } from './format'

const payLabel: Record<PaymentMethod, string> = {
  pix: 'Pix',
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
  dinheiro: 'Dinheiro (espécie)',
}

export function buildCartWhatsAppMessage(
  lines: CartLine[],
  extra?: { address?: string; payment?: PaymentMethod | ''; changeFor?: string },
): string {
  const items = lines
    .map(
      (l) =>
        `• ${l.qty}x ${l.brand} ${l.productName} — ${l.flavorName} — ${formatBRL(l.unitPrice)} un.`,
    )
    .join('\n')
  const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)
  let msg = `Olá ${BRAND.name}! Quero fechar pedido:\n\n${items}\n\nTotal: ${formatBRL(total)}`
  msg += `\n\nEntrega: ${BRAND.deliveryLine}`
  if (extra?.address) msg += `\nEndereço: ${extra.address}`
  if (extra?.payment) msg += `\nPagamento: ${payLabel[extra.payment]}`
  if (extra?.payment === 'dinheiro' && extra.changeFor?.trim()) {
    msg += `\nTroco para: ${extra.changeFor.trim()}`
  }
  return msg
}

export function buildSingleProductOrderMessage(payload: {
  brand: string
  productName: string
  flavorName: string
  qty: number
  unitPrice: number
  address: string
  payment: PaymentMethod
  changeFor?: string
}): string {
  const lineTotal = payload.unitPrice * payload.qty
  let msg = `Olá ${BRAND.name}! Pedido:\n\n`
  msg += `${payload.brand} ${payload.productName}\nSabor: ${payload.flavorName}\nQtd: ${payload.qty}x\n`
  msg += `Subtotal: ${formatBRL(lineTotal)}`
  msg += `\n\nEndereço completo:\n${payload.address}`
  msg += `\nPagamento: ${payLabel[payload.payment]}`
  if (payload.payment === 'dinheiro' && payload.changeFor?.trim()) {
    msg += `\nTroco para: ${payload.changeFor.trim()}`
  }
  msg += `\n\nConfirmação de entrega em ${BRAND.deliveryLine}.`
  return msg
}

export function cartWhatsAppLink(
  lines: CartLine[],
  extra?: { address?: string; payment?: PaymentMethod | ''; changeFor?: string },
): string | null {
  if (lines.length === 0) return null
  return whatsappUrlWithText(buildCartWhatsAppMessage(lines, extra))
}

export function singleOrderWhatsAppLink(payload: Parameters<typeof buildSingleProductOrderMessage>[0]): string {
  return whatsappUrlWithText(buildSingleProductOrderMessage(payload))
}
