export async function generateBlockchainHash(data: {
  userId: string;
  emotion: string;
  score: number;
  timestamp: string;
}): Promise<string> {
  const anonymizedData = {
    emotion: data.emotion,
    score: data.score,
    timestamp: data.timestamp,
    salt: crypto.randomUUID(),
  };

  const dataString = JSON.stringify(anonymizedData);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `0x${hashHex}`;
}

export function getEmotionScore(emotion: string): number {
  const scores: Record<string, number> = {
    great: 100,
    good: 75,
    okay: 50,
    stressed: 40,
    exhausted: 20,
  };
  return scores[emotion] || 50;
}
