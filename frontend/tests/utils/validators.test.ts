import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidStudentId, isNonEmpty } from '@/utils/validators';

describe('validators - Happy Paths', () => {
  it('isValidEmail correctly identifies valid institutional and standard emails', () => {
    expect(isValidEmail('estudiante@unilib.edu')).toBe(true);
    expect(isValidEmail('profesor.garcia@university.org')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
  });

  it('isValidStudentId verifies minimum length for campus identifiers', () => {
    expect(isValidStudentId('EST-1024')).toBe(true);
    expect(isValidStudentId('LIB-002')).toBe(true);
    expect(isValidStudentId('123')).toBe(false);
    expect(isValidStudentId('')).toBe(false);
  });

  it('isNonEmpty detects empty or whitespace-only inputs', () => {
    expect(isNonEmpty('Introduction to Algorithms')).toBe(true);
    expect(isNonEmpty('   ')).toBe(false);
    expect(isNonEmpty('')).toBe(false);
  });
});
