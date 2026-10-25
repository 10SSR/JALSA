import { EventProfile, TimelineEngineOutput, TimelineTask } from '@/lib/validation';
import { getEventTemplate } from './templates';

/**
 * Pure TS Reverse Timeline Engine
 * Calculates task deadlines backwards from event date, detects critical path,
 * overdue/at-risk states, and applies timeline compression for short lead times.
 */
export function calculateReverseTimeline(
  profile: EventProfile,
  referenceDateStr?: string
): TimelineEngineOutput {
  const template = getEventTemplate(profile.eventType);
  const eventDate = new Date(profile.date);
  const now = referenceDateStr ? new Date(referenceDateStr) : new Date();

  // Calculate lead time in weeks
  const diffTime = eventDate.getTime() - now.getTime();
  const leadTimeDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const leadTimeWeeks = Math.max(1, Math.round(leadTimeDays / 7));

  // If lead time is less than standard ~26 weeks (180 days), compression factor is applied
  const isCompressed = leadTimeDays < 120;
  const compressionRatio = isCompressed ? Math.max(0.25, leadTimeDays / 180) : 1;

  // Blueprints
  const blueprints = template.taskBlueprints;

  // Generate tasks
  const tasks: TimelineTask[] = blueprints.map((bp) => {
    // Compress days if needed
    let daysBefore = Math.round(bp.defaultDaysBeforeEvent * compressionRatio);
    if (daysBefore >= leadTimeDays) {
      // If task was supposed to be done earlier than today, place it closely ahead of today
      daysBefore = Math.max(1, Math.round(leadTimeDays * 0.85));
    }

    const taskDueDate = new Date(eventDate);
    taskDueDate.setDate(taskDueDate.getDate() - daysBefore);

    const dueDateIso = taskDueDate.toISOString().split('T')[0];

    // Status: check if overdue or at risk
    const isOverdue = taskDueDate < now;
    const daysUntilDue = Math.round(
      (taskDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isAtRisk = !isOverdue && daysUntilDue <= 7 && bp.priority === 'critical';

    // Compression notice
    let compressionNotice: string | undefined;
    if (isCompressed && bp.defaultDaysBeforeEvent > leadTimeDays) {
      compressionNotice = `Compressed from ${bp.defaultDaysBeforeEvent}d to ${daysBefore}d due to short ${leadTimeWeeks}-week lead time.`;
    }

    // Critical path identification:
    // Core critical chain for celebration: venue -> catering -> decor -> invites -> walkthrough
    const criticalChainIds = new Set([
      'task-venue-book',
      'task-caterer-tasting',
      'task-decor-concept',
      'task-invitations-send',
      'task-final-venue-walkthrough',
      'task-bday-venue',
      'task-bday-invites',
      'task-comm-grounds',
      'task-comm-caterer',
    ]);
    const isCriticalPath = criticalChainIds.has(bp.id) || bp.priority === 'critical';

    return {
      id: bp.id,
      title: bp.title,
      category: bp.category,
      owner: bp.owner,
      dueDate: dueDateIso,
      daysBeforeEvent: daysBefore,
      priority: bp.priority,
      status: isOverdue ? 'pending' : 'pending',
      dependencies: bp.dependencies,
      isCriticalPath,
      isOverdue,
      isAtRisk,
      compressionNotice,
    };
  });

  // Sort tasks chronologically by due date ascending (earliest tasks first)
  tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const criticalPathCount = tasks.filter((t) => t.isCriticalPath).length;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;
  const atRiskCount = tasks.filter((t) => t.isAtRisk).length;

  return {
    tasks,
    criticalPathCount,
    overdueCount,
    atRiskCount,
    isCompressed,
    leadTimeWeeks,
  };
}
