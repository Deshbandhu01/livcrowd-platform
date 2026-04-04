import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Location, CrowdEvent } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const useCrowdData = (locationId?: string) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [events, setEvents] = useState<Record<string, CrowdEvent[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'locations';
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snap) => {
      const locs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
      setLocations(locs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (locations.length === 0) return;

    const unsubscribes = locations.map(loc => {
      const path = `locations/${loc.id}/events`;
      const eq = query(
        collection(db, path),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      return onSnapshot(eq, (snap) => {
        const evs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CrowdEvent)).reverse();
        setEvents(prev => ({ ...prev, [loc.id]: evs }));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [locations]);

  return { locations, events, loading };
};
