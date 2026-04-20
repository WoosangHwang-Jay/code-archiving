export async function interpretWithGemini(
  mode: 'saju_only' | 'combined',
  saju_data: any,
  tarot_cards?: any[],
  currentDateStr?: string
) {
  const response = await fetch('/api/interpret', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode,
      saju_data,
      tarot_cards,
      currentDateStr
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorPrefix = data.error === 'API_KEY_MISSING' ? 'API_KEY_MISSING' : data.error;
    throw new Error(errorPrefix);
  }

  return data.result;
}
