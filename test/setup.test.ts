import { expect } from 'chai';

describe('Setup', () => {
  it('should pass a basic test', () => {
    expect(true).to.equal(true);
  });

  it('should import types correctly', async () => {
    const types = await import('../src/types/index.js');
    expect(types).to.exist;
  });
});
