export async function sendPushNotification(lineUserIds: string[], message: string): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN!

  await Promise.allSettled(
    lineUserIds.map((userId) =>
      fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: userId,
          messages: [{ type: 'text', text: message }],
        }),
      })
    )
  )
}
