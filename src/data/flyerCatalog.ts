import type { CatalogProduct } from '../types'

const F = (id: string, name: string, stock = 10) => ({ id, name, stock })

/** Produtos e preços das fotos promocionais DH (jun/2026) */
export const flyerCatalog: CatalogProduct[] = [
  {
    id: 'ignite-v-nano-1k',
    brand: 'Ignite',
    productKind: 'POD',
    name: 'V Nano 1000puffs',
    puffs: '1.000 puffs',
    nicotine: '50mg',
    shortDescription: 'Ignite V Nano compacto — ideal para levar no bolso. Entrega grátis em Unaí.',
    price: 49.9,
    image: 'https://hardvp.com/wp-content/uploads/2025/11/318033240e3ab2993fffd4f2d2eaecb4e4c28a52.webp',
    flavors: [
      F('fly-nano-01', '🌿🧊 Icy mint'),
      F('fly-nano-02', '🍌🧊 Banana gelado'),
      F('fly-nano-03', '🍊🧊 Laranja gelado'),
      F('fly-nano-04', '🍇🧊 Uva gelado'),
      F('fly-nano-05', '🍍🧊 Abacaxi gelado'),
      F('fly-nano-06', '🌴 Tropical'),
      F('fly-nano-07', '🌿 Menthol'),
      F('fly-nano-08', '🍓🧊 Morango gelado'),
      F('fly-nano-09', '🥝🍋 Maracujá/kiwi'),
      F('fly-nano-10', '🍉🧊 Melancia gelado'),
      F('fly-nano-11', '🥤 Coca cola'),
      F('fly-nano-12', '🍓🍈 Morango/goiaba gelado'),
    ],
  },
  {
    id: 'ignite-30k',
    brand: 'Ignite',
    productKind: 'POD',
    name: 'V300 30000puffs',
    puffs: '30.000 puffs',
    nicotine: '50mg',
    shortDescription: 'Ignite V300 com tela, 30 mil puffs e sabores gelados premium.',
    price: 139.9,
    image: 'https://clubedovapor.co/13062-thickbox_default/pod-ignite-v300-30000-puffs.jpg',
    flavors: [
      F('fly-v300-01', '🌿🍈 Menta/melão'),
      F('fly-v300-02', '🍇🧊 Uva gelado'),
      F('fly-v300-03', '🌿 Menthol'),
      F('fly-v300-04', '🌿🧊 Ice mint'),
      F('fly-v300-05', '🍏 Maçã verde'),
      F('fly-v300-06', '🍉 Melancia'),
      F('fly-v300-07', '🍉🧊 Melancia gelado'),
      F('fly-v300-08', '🍓🧊 Morango gelado'),
      F('fly-v300-09', '🍓🍌 Morango/banana'),
      F('fly-v300-10', '🍍🧊 Abacaxi gelado'),
      F('fly-v300-11', '🍍🥭 Abacaxi/manga'),
      F('fly-v300-12', '🫐🧊 Mirtilo gelado'),
    ],
  },
  {
    id: 'waka-7k',
    brand: 'Waka',
    productKind: 'POD',
    name: '7000puffs',
    puffs: '7.000 puffs',
    nicotine: '50mg',
    shortDescription: 'Waka 7000 — design slim, display digital e sabores frutados.',
    price: 119.9,
    image: 'https://www.wolfshopbrasil.net/wp-content/uploads/2025/10/Principal-Pod-Descartavel-NIKBAR-30K-na-Wolf-Shop-Brasil-768x768.jpg',
    flavors: [
      F('fly-w7k-01', '🍏 Maçã verde'),
      F('fly-w7k-02', '🍇 Uva'),
      F('fly-w7k-03', '🥝 Maracujá'),
      F('fly-w7k-04', '🫐 Mirtilo'),
      F('fly-w7k-05', '🍉 Melancia'),
      F('fly-w7k-06', '🍓🥝 Morango/kiwi'),
      F('fly-w7k-07', '🍓 Morango'),
      F('fly-w7k-08', '🌿 Hortelã/menta'),
      F('fly-w7k-09', '🍒 Cereja'),
    ],
  },
  {
    id: 'waka-25k',
    brand: 'Waka',
    productKind: 'POD',
    name: '25000puffs',
    puffs: '25.000 puffs',
    nicotine: '50mg',
    shortDescription: 'Waka 25000 com display, alto rendimento e 16 sabores disponíveis.',
    price: 89.9,
    image: 'https://www.wolfshopbrasil.net/wp-content/uploads/2025/10/Principal-Pod-Descartavel-NIKBAR-30K-na-Wolf-Shop-Brasil-768x768.jpg',
    flavors: [
      F('fly-w25k-01', '🍉🍑 Melancia/pêssego'),
      F('fly-w25k-02', '🍉🧊 Melancia gelado'),
      F('fly-w25k-03', '🍑🥭🍉 Pêssego/manga/melancia'),
      F('fly-w25k-04', '🍓🍉🌵 Morango/melancia/pitaya'),
      F('fly-w25k-05', '🍓🫐 Morango/framboesa'),
      F('fly-w25k-06', '🍓 Morango'),
      F('fly-w25k-07', '🍓🍇 Morango/uva'),
      F('fly-w25k-08', '🍓🍈🍑 Morango/melão/pêssego'),
      F('fly-w25k-09', '🍓🥝 Morango/kiwi'),
      F('fly-w25k-10', '🍇🧊 Uva gelado'),
      F('fly-w25k-11', '🍇 Chiclete de uva'),
      F('fly-w25k-12', '🌿 Menthol'),
      F('fly-w25k-13', '🌿🧊 Icy mint'),
      F('fly-w25k-14', '🍌🫐 Banana/açaí'),
      F('fly-w25k-15', '🍈🧊 Melão gelado'),
      F('fly-w25k-16', '🥝🍈🍋 Maracujá/goiaba/kiwi'),
    ],
  },
  {
    id: 'lifepod-ipod-refil-13k',
    brand: 'Life Pod',
    productKind: 'POD',
    name: 'Refil i Pod 13000puffs',
    puffs: '13.000 puffs',
    nicotine: '50mg',
    shortDescription: 'Refil i Pod 13K — compatível com bateria Eco 2 (Life Pod).',
    price: 89.9,
    image: 'https://images.tcdn.com.br/img/img_prod/722367/pod_descartavel_refil_life_pod_eco_5_8000_3659_1_de427cebd18f2cc8f30e2b50ce24289d.png',
    flavors: [
      F('fly-ipod-01', '🍇🧊 Uva gelada'),
      F('fly-ipod-02', '🌿 Menthol'),
      F('fly-ipod-03', '🌿 Hortelã/menta'),
      F('fly-ipod-04', '🍓🥝🧊 Morango/kiwi gelado'),
      F('fly-ipod-05', '🍓🍉🧊 Morango/melancia gelado'),
      F('fly-ipod-06', '🍓🧊 Morango gelado'),
      F('fly-ipod-07', '🍉🧊 Melancia gelado'),
      F('fly-ipod-08', '❤️ Love 66'),
      F('fly-ipod-09', '🥝🍍🍈 Kiwi/abacaxi/goiaba gelado'),
    ],
  },
]

/** Atualiza ou insere produtos das fotos no catálogo */
export function mergeFlyerCatalog(catalog: CatalogProduct[]): CatalogProduct[] {
  const result = catalog.map((p) => {
    const flyer = flyerCatalog.find((f) => f.id === p.id)
    return flyer ?? p
  })

  for (const fp of flyerCatalog) {
    if (result.some((p) => p.id === fp.id)) continue

    let insertAt = result.length
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].brand === fp.brand) {
        insertAt = i + 1
        break
      }
    }
    if (insertAt === result.length) {
      const firstSame = result.findIndex((p) => p.brand === fp.brand)
      if (firstSame >= 0) insertAt = firstSame
    }
    result.splice(insertAt, 0, fp)
  }

  return result
}
