import type { ExerciseDef, ExerciseId } from '../lib/types';
import { Lista, LISTA_MAX_LEVEL } from './Lista';
import { Numeros, NUMEROS_MAX_LEVEL } from './Numeros';
import { Parejas, PAREJAS_MAX_LEVEL } from './Parejas';
import { Secuencia, SECUENCIA_MAX_LEVEL } from './Secuencia';

/** `trials` is chosen so each exercise takes roughly 4 minutes. */
export const EXERCISES: Record<ExerciseId, ExerciseDef> = {
  parejas: { id: 'parejas', icon: '🃏', trials: 3, maxLevel: PAREJAS_MAX_LEVEL, Component: Parejas },
  secuencia: { id: 'secuencia', icon: '🟨', trials: 5, maxLevel: SECUENCIA_MAX_LEVEL, Component: Secuencia },
  numeros: { id: 'numeros', icon: '🔢', trials: 5, maxLevel: NUMEROS_MAX_LEVEL, Component: Numeros },
  lista: { id: 'lista', icon: '🛒', trials: 3, maxLevel: LISTA_MAX_LEVEL, Component: Lista },
};
