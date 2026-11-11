import { describe, expect, it } from 'vitest';

import type { VendorMembership } from '@/features/account/types';
import {
  canManageBusiness,
  parseListingStatus,
  parseVendorRole,
  parseVerificationStatus,
  resolveAccountState,
  vendorStanding,
  type ResolveAccountInput,
} from '@/features/account/utils/accountState';

function vendor(overrides: Partial<VendorMembership> = {}): VendorMembership {
  return {
    vendorId: 'v1',
    businessName: 'Meskel Events',
    slug: 'meskel-events',
    logoUrl: null,
    verificationStatus: 'verified',
    listingStatus: 'published',
    role: 'owner',
    isLegalOwner: true,
    ...overrides,
  };
}

function input(overrides: Partial<ResolveAccountInput> = {}): ResolveAccountInput {
  return {
    isRestoring: false,
    hasSession: true,
    vendors: { status: 'success', data: [vendor()] },
    preferredVendorId: null,
    ...overrides,
  };
}

describe('resolveAccountState', () => {
  it('waits for session restore before anything else', () => {
    expect(resolveAccountState(input({ isRestoring: true, hasSession: false }))).toEqual({ kind: 'restoring' });
  });

  it('is signed out without a session', () => {
    expect(resolveAccountState(input({ hasSession: false })).kind).toBe('signed_out');
  });

  it('keeps loading until both businesses and the stored preference are known', () => {
    expect(resolveAccountState(input({ vendors: { status: 'pending' } })).kind).toBe('loading_businesses');
    expect(resolveAccountState(input({ preferredVendorId: undefined })).kind).toBe('loading_businesses');
  });

  it('surfaces load errors instead of sending the user to onboarding', () => {
    const state = resolveAccountState(input({ vendors: { status: 'error', message: 'Network error' } }));
    expect(state).toEqual({ kind: 'error', message: 'Network error' });
  });

  it('routes a user with no business to onboarding', () => {
    expect(resolveAccountState(input({ vendors: { status: 'success', data: [] } })).kind).toBe('no_business');
  });

  it('auto-selects the only business', () => {
    const state = resolveAccountState(input());
    expect(state.kind).toBe('workspace');
    if (state.kind === 'workspace') expect(state.standing).toBe('live');
  });

  it('asks to choose between several businesses without a valid stored choice', () => {
    const data = [vendor(), vendor({ vendorId: 'v2' })];
    expect(resolveAccountState(input({ vendors: { status: 'success', data } })).kind).toBe('choose_business');
    expect(
      resolveAccountState(input({ vendors: { status: 'success', data }, preferredVendorId: 'gone' })).kind,
    ).toBe('choose_business');
  });

  it('honours a stored choice that is still accessible', () => {
    const data = [vendor(), vendor({ vendorId: 'v2', businessName: 'Second' })];
    const state = resolveAccountState(input({ vendors: { status: 'success', data }, preferredVendorId: 'v2' }));
    expect(state.kind === 'workspace' && state.vendor.businessName).toBe('Second');
  });
});

describe('vendorStanding', () => {
  it.each([
    ['unverified', 'draft', 'draft'],
    ['pending', 'draft', 'pending_review'],
    ['rejected', 'draft', 'rejected'],
    ['verified', 'draft', 'verified_unpublished'],
    ['verified', 'published', 'live'],
    ['verified', 'suspended', 'suspended'],
    ['unverified', 'published', 'draft'],
  ] as const)('%s + %s → %s', (verificationStatus, listingStatus, expected) => {
    expect(vendorStanding({ verificationStatus, listingStatus })).toBe(expected);
  });
});

describe('parsers', () => {
  it('fall back to the most restrictive value', () => {
    expect(parseVerificationStatus('weird')).toBe('unverified');
    expect(parseListingStatus('weird')).toBe('draft');
    expect(parseVendorRole('weird')).toBe('staff');
  });

  it('only owners and managers manage the business', () => {
    expect(canManageBusiness('owner')).toBe(true);
    expect(canManageBusiness('manager')).toBe(true);
    expect(canManageBusiness('staff')).toBe(false);
  });
});
