export type ReviewFilter = 'published' | 'pending';

export const REVIEW_FILTERS: { key: ReviewFilter; label: string }[] = [
  { key: 'published', label: 'Published' },
  { key: 'pending', label: 'Pending' },
];

export const REVIEW_PILL: Record<
  ReviewFilter | 'hidden',
  { label: string; tone: 'success' | 'warning' | 'neutral' }
> = {
  published: { label: 'Published', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  hidden: { label: 'Hidden', tone: 'neutral' },
};
