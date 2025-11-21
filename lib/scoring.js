/**
 * Mock AI Scoring System
 * Simulates processing a target image to detect shots and calculate score.
 */
export async function calculateScore(imageBuffer) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock logic: Generate 5 random shots
    const shots = [];
    let totalPoints = 0;

    for (let i = 0; i < 5; i++) {
        // Random score between 7 and 10 (weighted towards higher scores for "precision")
        const points = Math.floor(Math.random() * 4) + 7;
        // Random coordinates relative to center (0.5, 0.5)
        const x = 0.5 + (Math.random() - 0.5) * 0.2;
        const y = 0.5 + (Math.random() - 0.5) * 0.2;

        shots.push({ points, x, y });
        totalPoints += points;
    }

    return {
        totalPoints,
        shots,
        seriesId: Date.now().toString()
    };
}
