export class VoiceBlender {
  /**
   * Get raw 256-dim embedding for a voice ID
   */
  public static getVoiceVector(voiceId: string): number[] {
    try {
      const voicesData: Record<string, number[]> = require('../assets/voices.json');
      if (voicesData && voicesData[voiceId]) {
        return [...voicesData[voiceId]];
      }
    } catch (_) {}
    return new Array(256).fill(0);
  }

  /**
   * Blend two voice embeddings with weight ratio
   * @param voiceA First voice ID
   * @param voiceB Second voice ID
   * @param ratio Float from 0.0 (100% voiceA) to 1.0 (100% voiceB)
   */
  public static blendVoices(voiceA: string, voiceB: string, ratio: number = 0.5): number[] {
    const vecA = this.getVoiceVector(voiceA);
    const vecB = this.getVoiceVector(voiceB);

    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const weightA = 1 - clampedRatio;
    const weightB = clampedRatio;

    const blended: number[] = new Array(256);
    let normSq = 0;

    for (let i = 0; i < 256; i++) {
      const val = (vecA[i] || 0) * weightA + (vecB[i] || 0) * weightB;
      blended[i] = val;
      normSq += val * val;
    }

    // Energy normalization to preserve natural vocal volume & dynamics
    const targetNorm = 16.0; // typical norm for 256-dim style embedding
    const currentNorm = Math.sqrt(normSq) || 1.0;
    const scale = targetNorm / currentNorm;

    return blended.map((v) => v * scale);
  }

  /**
   * Helper to retrieve style embedding with optional blending
   */
  public static getBlendedEmbedding(
    primaryVoiceId: string,
    secondaryVoiceId?: string,
    blendRatio?: number
  ): number[] {
    if (secondaryVoiceId && blendRatio !== undefined && blendRatio > 0) {
      return this.blendVoices(primaryVoiceId, secondaryVoiceId, blendRatio);
    }
    return this.getVoiceVector(primaryVoiceId);
  }
}
