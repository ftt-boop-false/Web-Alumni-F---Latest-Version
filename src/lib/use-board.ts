import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { loadBoard, saveBoardItem, removeBoardItem, loadForumUsers } from './board-store';

/**
 * Drop-in pengganti useState untuk daftar item papan forum.
 * - Memuat dari Firestore saat mount (seed data demo bila kosong).
 * - Memuat registry penulis (forumUsers) agar nama penulis asli tampil.
 * - Mem-persist perubahan secara otomatis: item baru/berubah disimpan,
 *   item yang hilang dihapus. Komponen cukup memakai setItems seperti useState.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useBoard<T extends { id: any }>(
  name: string,
  seed: T[],
): [T[], Dispatch<SetStateAction<T[]>>, boolean] {
  const [items, setItems] = useState<T[]>(seed);
  const [loaded, setLoaded] = useState(false);
  const prev = useRef<T[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await loadForumUsers();
      const data = await loadBoard(name, seed);
      if (!alive) return;
      setItems(data);
      prev.current = data;
      setLoaded(true);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!loaded) return;
    const prevMap = new Map(prev.current.map((i) => [i.id, i]));
    for (const item of items) {
      const old = prevMap.get(item.id);
      if (!old || JSON.stringify(old) !== JSON.stringify(item)) saveBoardItem(name, item);
      prevMap.delete(item.id);
    }
    for (const removed of prevMap.values()) removeBoardItem(name, removed.id);
    prev.current = items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, loaded]);

  return [items, setItems, loaded];
}
