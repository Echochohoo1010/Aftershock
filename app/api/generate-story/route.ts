import { NextRequest, NextResponse } from 'next/server'
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
    let scenario = "unknown scenario" // Default value for error handling

    try {
        const requestData = await request.json()
        scenario = requestData.scenario || "unknown scenario"
        const prompt = requestData.prompt

        // Use your existing Google Gemini AI setup
        const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || "" })

        const result = await generateText({
            model: google("gemini-2.0-flash"),
            prompt: `You are a policy scenario generator. Create engaging, realistic policy scenarios with meaningful choices and consequences.

${prompt}

IMPORTANT: Respond with ONLY valid JSON, no additional text or formatting. The JSON must be parseable.`,
            temperature: 0.8,
            maxTokens: 1000,
        })

        const aiContent = result.text

        // Clean and parse the AI response as JSON
        let cleanedContent = aiContent.trim()

        // Remove markdown code blocks if present
        if (cleanedContent.startsWith('```json')) {
            cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
        } else if (cleanedContent.startsWith('```')) {
            cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
        }

        // Remove any leading/trailing text that isn't JSON
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            cleanedContent = jsonMatch[0]
        }

        let storyData
        try {
            storyData = JSON.parse(cleanedContent)
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', aiContent)
            console.error('Cleaned content:', cleanedContent)
            console.error('Parse error:', parseError)
            throw new Error('AI returned invalid JSON format')
        }

        // Validate the response structure
        if (!storyData.title || !storyData.content || !storyData.choices) {
            throw new Error('AI response missing required fields')
        }

        return NextResponse.json(storyData)

    } catch (error) {
        console.error('AI story generation error:', error)

        // Return a fallback response
        return NextResponse.json({
            title: "AI Generation Failed",
            content: `You face an unexpected challenge: the AI system couldn't generate a story for "${scenario}". This represents the unpredictable nature of emerging technologies. Sometimes the most advanced systems fail at the most crucial moments, forcing human creativity to take the lead.`,
            choices: [
                {
                    description: "Try a different approach",
                    consequenceText: "You decide to adapt and find alternative solutions...",
                    impact: { compute: -5, unemployment: 2, geopolitics: "Technology adaptation challenges" }
                },
                {
                    description: "Rely on human expertise instead",
                    consequenceText: "You choose human judgment over AI assistance...",
                    impact: { compute: -10, unemployment: -5, geopolitics: "Human-centric decision making" }
                },
                {
                    description: "Investigate the system failure",
                    consequenceText: "You dig deeper into why the AI failed...",
                    impact: { compute: 5, unemployment: 0, geopolitics: "AI reliability concerns" }
                }
            ],
            worldState: { t: 3, compute: -5, unemployment: 2, geopolitics: "AI system limitations exposed" }
        })
    }
}