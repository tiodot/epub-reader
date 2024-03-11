import { useLiveQuery } from 'dexie-react-hooks';
import {db} from '../utils/db';

export function useLibrary() {
  return useLiveQuery(() => db?.books.toArray() ?? []);
}