import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { MAP_CENTER, type Venue, VENUES } from '@/lib/places';

/** Un repère rond aux couleurs des Jeux ; plus grand et jaune quand le lieu est choisi. */
function pin(count: number, active: boolean) {
  const size = active ? 44 : 34;
  const bg = active ? '#f5d90a' : count > 0 ? '#0a7a3d' : '#8a9a8f';
  const fg = active ? '#3a2f00' : '#fff';
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:grid;place-items:center;width:${size}px;height:${size}px;border-radius:9999px;background:${bg};color:${fg};font:800 ${active ? 16 : 14}px 'Bricolage Grotesque',sans-serif;border:3px solid #fff;box-shadow:0 4px 14px rgb(0 0 0 / .3);transition:all .2s">${count}</span>`,
  });
}

const meIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: '<span style="display:block;width:20px;height:20px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px rgb(37 99 235 / .25)"></span>',
});

/**
 * La carte OpenStreetMap des lieux. Leaflet garde son propre état : React ne fait que lui dire
 * quels repères afficher, lequel est choisi, et où se trouve la personne.
 */
export function VenueMap({
  venues,
  counts,
  selected,
  me,
  onSelect,
}: {
  venues: Venue[];
  counts: Record<string, number>;
  selected: string | null;
  me: [number, number] | null;
  onSelect: (name: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const meMarker = useRef<L.Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView(MAP_CENTER, 11);
    // Tous les lieux visibles d'un coup d'œil, quelle que soit la largeur de l'écran.
    instance.fitBounds(L.latLngBounds(VENUES.map((v) => [v.lat, v.lng])), { padding: [30, 30] });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; contributeurs OpenStreetMap',
    }).addTo(instance);
    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);
    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const group = markers.current;
    if (!group) return;
    group.clearLayers();
    for (const venue of venues) {
      L.marker([venue.lat, venue.lng], {
        icon: pin(counts[venue.name] ?? 0, venue.name === selected),
        title: venue.name,
        zIndexOffset: venue.name === selected ? 1000 : 0,
      })
        .on('click', () => onSelectRef.current(venue.name))
        .addTo(group);
    }
  }, [venues, counts, selected]);

  useEffect(() => {
    const venue = venues.find((v) => v.name === selected);
    if (venue) map.current?.flyTo([venue.lat, venue.lng], 14, { duration: 0.8 });
  }, [selected, venues]);

  useEffect(() => {
    if (!map.current || !me) return;
    meMarker.current?.remove();
    meMarker.current = L.marker(me, { icon: meIcon, title: 'Ma position' }).addTo(map.current);
    map.current.flyTo(me, 13, { duration: 0.8 });
  }, [me]);

  return (
    <div
      ref={container}
      role="region"
      aria-label="Carte des lieux"
      className="z-0 h-80 w-full overflow-hidden rounded-3xl border shadow-lg sm:h-[32rem]"
    />
  );
}
