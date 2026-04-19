# Mentor profielfoto’s – resolutie en formaten

De mentorfoto’s worden getoond in kaarten met **vaste hoogte 256px** (`h-64`) en **variabele breedte** (afhankelijk van viewport). De afbeelding wordt gecropt met `object-cover` en `object-top`, zodat het gezicht altijd zichtbaar blijft.

## Weergave in de app

| Viewport        | Kaartbreedte (ongeveer) | Breedte 1× | Breedte 2× (Retina) |
|-----------------|--------------------------|------------|----------------------|
| Mobiel (&lt;640px)  | 100% (ca. 320–428px)     | 430px      | 860px                |
| Tablet (640–1024px) | 50% (ca. 360–512px)    | 520px      | 1040px               |
| Desktop (max-w-6xl) | 50% (ca. 552px)        | 560px      | **1120px**           |

Voor scherpe weergave op Retina/hoge-DPI schermen moet de **bronbreedte minstens ~2× de weergavebreedte** zijn. De grootste benodigde breedte is dus **ca. 1120px** (2× 560px).

---

## Optie 1: Eén bestand per mentor (eenvoudig)

**Aanbevolen resolutie:** **1200 × 1500 px** (verhouding 4:5, portret).

- **Breedte 1200px** dekt alle viewports inclusief 2×.
- **Hoogte 1500px** geeft voldoende ruimte; met `object-top` blijft het gezicht (bovenaan) in beeld.
- **Compositie:** gezicht in het **bovenste 30–40%** van de foto, zodat er bij crop geen afsnijding is.

**Bestandsformaat:**

- **WebP** (aanbevolen): kleinere bestanden, goede kwaliteit. Kwaliteit 80–85%.
- **JPG:** alternatief, kwaliteit 82–85%.
- Streef naar **&lt; 250 KB** per foto.

**Supabase:** upload als bijvoorbeeld `mentor-photos/rousso.webp` en `mentor-photos/jason.webp`.

---

## Optie 2: Meerdere formaten (optimaal voor performance)

Host 2 of 3 resoluties per mentor; de app kan dan met `srcset` de juiste grootte laden.

| Formaat   | Resolutie   | Gebruik                    | Bestandsnaam (voorbeeld) |
|----------|-------------|----------------------------|---------------------------|
| Klein    | 480 × 600 px | Mobiel, 1×                 | `rousso-480.webp`         |
| Medium   | 800 × 1000 px| Tablet, kleine desktop      | `rousso-800.webp`         |
| Groot    | 1200 × 1500 px | Desktop, Retina          | `rousso-1200.webp`        |

**Verhouding:** overal 4:5 (portret), gezicht weer in het bovenste deel.

In de app kun je per mentor een `image` (fallback) en optioneel `imageSrcSet` meegeven; `MentorCard` ondersteunt srcset.

**Voorbeeld (mentorship page) wanneer je meerdere formaten hebt:**

```ts
{
  name: 'Rousso',
  role: 'Technical Trading Mentor',
  image: 'https://.../mentor-photos/rousso-1200.webp',
  imageSrcSet: [
    { width: 480, url: 'https://.../mentor-photos/rousso-480.webp' },
    { width: 800, url: 'https://.../mentor-photos/rousso-800.webp' },
    { width: 1200, url: 'https://.../mentor-photos/rousso-1200.webp' },
  ],
  calendlyUrl: '...',
}
```

---

## Checklist voor upload

1. **Verhouding:** 4:5 (portret).
2. **Gezicht:** in het bovenste 30–40% van het frame.
3. **Resolutie:** minimaal 1200×1500 voor één bestand; bij meerdere formaten: 480w, 800w, 1200w.
4. **Formaat:** WebP (of JPG), kwaliteit 80–85%.
5. **Bestandsgrootte:** liefst &lt; 250 KB per foto (bij 1200×1500).

Dit zorgt ervoor dat de foto’s op alle devices en breedtes scherp en goed gekaderd blijven.
