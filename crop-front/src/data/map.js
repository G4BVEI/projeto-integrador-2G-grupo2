// data/map.js
export const mapFields = [
  {
    id: 1,
    name: 'Encosta Alta',
    description: 'Área de cultivo de soja em terreno inclinado.',
    coords: [
      [-27.2105, -52.002],
      [-27.2095, -52.000],
      [-27.2085, -52.002],
      [-27.2095, -52.004],
    ],
    type: 'lavoura',
    color: 'green',
  },
  {
    id: 2,
    name: 'Vale Verde',
    description: 'Produção de milho com irrigação central.',
    coords: [
      [-27.2505, -52.0505],
      [-27.2495, -52.0485],
      [-27.2485, -52.0505],
      [-27.2495, -52.0525],
    ],
    type: 'lavoura',
    color: 'green',
  },
  {
    id: 3,
    name: 'Campo Sombreado',
    description: 'Área experimental com sensores climáticos.',
    coords: [
      [-27.2205, -52.032],
      [-27.2195, -52.030],
      [-27.2185, -52.032],
      [-27.2195, -52.034],
    ],
    type: 'sensor',
    color: 'blue',
  },
  {
    id: 4,
    name: 'Costa Norte',
    description: 'Pastagem para gado leiteiro.',
    coords: [
      [-27.2005, -52.012],
      [-27.1995, -52.010],
      [-27.1985, -52.012],
      [-27.1995, -52.014],
    ],
    type: 'pastagem',
    color: 'orange',
  },
]

export const mapCenter = [-27.23, -52.02]
export const mapZoom = 10
