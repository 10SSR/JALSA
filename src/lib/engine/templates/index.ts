import { EventType } from '@/lib/validation';
import { EventTemplateConfig } from './types';
import { weddingTemplate } from './wedding';
import { birthdayTemplate } from './birthday';
import { communityTemplate } from './community';

export * from './types';
export { weddingTemplate, birthdayTemplate, communityTemplate };

export const TEMPLATES: Record<EventType, EventTemplateConfig> = {
  wedding: weddingTemplate,
  birthday: birthdayTemplate,
  community: communityTemplate,
};

/**
 * Returns the matching event template configuration or falls back to wedding template
 */
export function getEventTemplate(type: EventType): EventTemplateConfig {
  return TEMPLATES[type] || weddingTemplate;
}
