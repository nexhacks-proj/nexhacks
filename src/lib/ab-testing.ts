// A/B testing utilities for prompt variants

export type PromptVariant = 'A' | 'B'

/**
 * Simple A/B test assignment based on candidate ID or random
 * Returns 'A' or 'B' consistently for the same input
 */
export function assignVariant(seed: string): PromptVariant {
  // Simple hash function for consistent assignment
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) % 2 === 0 ? 'A' : 'B'
}

/**
 * Metrics for evaluating pipeline performance
 */
export interface PipelineMetrics {
  validJSON: boolean
  requiredSkillCoverage: number // 0-1
  emailHasHooks: boolean
  emailHasNextSteps: boolean
  cardHasEvidence: boolean
  traceId?: string
  promptVariant: PromptVariant
  timestamp: Date
}

/**
 * Validate pipeline output and compute metrics
 */
export function computeMetrics(
  profile: any,
  card: any,
  email: any,
  promptVariant: PromptVariant,
  traceId?: string
): PipelineMetrics {
  // Check valid JSON structure
  const validJSON = !!(
    profile?.candidate &&
    card?.card &&
    card?.evidence &&
    email?.email &&
    email?.interview_pack
  )

  // Check required skill coverage (simplified - count skills in profile)
  const requiredSkillCoverage = validJSON && profile.candidate.skills
    ? Math.min(1, (
        profile.candidate.skills.programming_languages?.length || 0 +
        profile.candidate.skills.frameworks?.length || 0
      ) / 5) // Normalize to 0-1
    : 0

  // Check email has hooks
  const emailHasHooks = !!(
    email?.email?.personalization_hooks &&
    Array.isArray(email.email.personalization_hooks) &&
    email.email.personalization_hooks.length >= 2
  )

  // Check email has next steps
  const emailHasNextSteps = !!(
    email?.email?.next_steps &&
    Array.isArray(email.email.next_steps) &&
    email.email.next_steps.length >= 2
  )

  // Check card has evidence
  const cardHasEvidence = !!(
    card?.evidence?.reason_evidence &&
    Array.isArray(card.evidence.reason_evidence) &&
    card.evidence.reason_evidence.length > 0
  )

  return {
    validJSON,
    requiredSkillCoverage,
    emailHasHooks,
    emailHasNextSteps,
    cardHasEvidence,
    traceId,
    promptVariant,
    timestamp: new Date(),
  }
}

/**
 * Compare metrics between two variants
 */
export function compareVariants(metricsA: PipelineMetrics, metricsB: PipelineMetrics) {
  return {
    validJSONRate: {
      A: metricsA.validJSON ? 1 : 0,
      B: metricsB.validJSON ? 1 : 0,
    },
    avgSkillCoverage: {
      A: metricsA.requiredSkillCoverage,
      B: metricsB.requiredSkillCoverage,
    },
    emailQuality: {
      A: (metricsA.emailHasHooks ? 1 : 0) + (metricsA.emailHasNextSteps ? 1 : 0),
      B: (metricsB.emailHasHooks ? 1 : 0) + (metricsB.emailHasNextSteps ? 1 : 0),
    },
    evidenceQuality: {
      A: metricsA.cardHasEvidence ? 1 : 0,
      B: metricsB.cardHasEvidence ? 1 : 0,
    },
  }
}
