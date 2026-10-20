import { CatalogueService } from './catalogue.service';

describe('CatalogueService.keepKnown', () => {
  const service = new CatalogueService();

  it('keeps known ids and drops unknown ones, preserving order', () => {
    expect(service.keepKnown(['bridging-loan', 'made-up', 'home-loan'])).toEqual([
      'bridging-loan',
      'home-loan',
    ]);
  });

  it('returns an empty list when nothing is known', () => {
    expect(service.keepKnown(['nope'])).toEqual([]);
    expect(service.keepKnown([])).toEqual([]);
  });
});
