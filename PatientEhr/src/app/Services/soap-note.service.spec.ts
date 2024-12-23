import { TestBed } from '@angular/core/testing';

import { SoapNoteService } from './soap-note.service';

describe('SoapNoteService', () => {
  let service: SoapNoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoapNoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
