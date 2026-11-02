import { LeadStatus } from '../types';

/**
 * State machine definition for the 8-stage transactional lifecycle of IsoTrack.
 * Defines strictly allowed transitions from stage X to stage Y or Z.
 */
export const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  lead_created: ['lead_approval', 'closed'],
  lead_approval: ['in_progress', 'follow_up'],
  in_progress: ['submission', 'follow_up'],
  submission: ['review', 'follow_up'],
  review: ['follow_up', 'final_approval'],
  follow_up: ['in_progress', 'submission', 'review'],
  final_approval: ['closed', 'follow_up'],
  closed: [], // Terminal state - read-only final archive
};

export const isValidTransition = (from: LeadStatus, to: LeadStatus): boolean => {
  const allowed = VALID_TRANSITIONS[from] || [];
  return allowed.includes(to);
};
