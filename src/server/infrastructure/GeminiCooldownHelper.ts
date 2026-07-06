export function checkQuotaCooldown(): boolean {
  const until = (global as any).__geminiQuotaExceededUntil;
  if (until && Date.now() < until) {
    const secLeft = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    console.warn(`[AI Cooldown] Gemini API is currently under a rate-limit cooldown for another ${secLeft}s. Directly bypassing to simulated/heuristic fallback.`);
    return true;
  }
  return false;
}

export function triggerQuotaCooldown(error: any) {
  const errMsg = error?.message || String(error || '');
  const isQuotaError = errMsg.includes('429') || 
                       /resource_exhausted/i.test(errMsg) || 
                       /quota/i.test(errMsg) || 
                       /rateLimit/i.test(errMsg) ||
                       /limit/i.test(errMsg);
                       
  if (isQuotaError) {
    const duration = 5 * 60 * 1000; // 5 minutes cooldown
    (global as any).__geminiQuotaExceededUntil = Date.now() + duration;
    console.warn(`[AI Cooldown] Quota / Rate limit (429 / RESOURCE_EXHAUSTED) detected: "${errMsg.substring(0, 150)}...". Triggering Gemini API cooldown for 5 minutes.`);
  }
}
