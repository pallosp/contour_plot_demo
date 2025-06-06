import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ShowEdgesCheckbox} from '../src/controls';

describe('ShowEdgesCheckbox', () => {
  it('initial state', () => {
    render(<ShowEdgesCheckbox setShowEdges={() => {}} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
