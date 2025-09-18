import '@testing-library/jest-dom/vitest'

import {cleanup} from '@testing-library/react'
import {DOMMatrix} from 'geometry-interfaces';
import {afterEach, vi} from 'vitest'

globalThis.DOMMatrix = DOMMatrix as typeof globalThis.DOMMatrix;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
