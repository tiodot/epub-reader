import {atomWithStorage} from 'jotai/utils'
import { BookItem } from '../components/BookCollection';

export const libraryStore = atomWithStorage<BookItem[]>('library', []);