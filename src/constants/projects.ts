export const PROJECT_CATEGORIES = [
  { id: 'RESIDENTIAL', label: 'Residential' },
  { id: 'COMMERCIAL', label: 'Commercial' },
  { id: 'INDUSTRIAL', label: 'Industrial' },
  { id: 'HEALTHCARE', label: 'Healthcare' },
  { id: 'RENOVATION', label: 'Renovation' },
  { id: 'SPORTS', label: 'Sports' }
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]['id'];

export function formatProjectCategory(category?: string | null) {
  if (!category) return 'Project';
  const match = PROJECT_CATEGORIES.find((item) => item.id === category);
  if (match) return match.label;
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
}
