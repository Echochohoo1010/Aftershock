import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
    let sourceTitle = '';
    let action = '';

    try {
        const { sourceTitle: title, sourceDescription, action: actionType, implications, metrics } = await request.json();
        sourceTitle = title;
        action = actionType;

        // Construct the prompt based on the action type
        let prompt = '';
        switch (action) {
            case 'branch':
                prompt = `Given this policy scenario: "${sourceTitle}" - ${sourceDescription}

Current implications: ${implications?.join(', ') || 'None specified'}
Current metrics: ${metrics?.join(', ') || 'None specified'}

Generate 3 alternative policy scenarios that branch from this one. Each should explore different approaches, stakeholder perspectives, or implementation strategies. For each scenario, provide:
1. A clear, concise title
2. A brief description (2-3 sentences)
3. 2-3 key implications
4. 2-3 success metrics

Format as JSON array with objects containing: title, description, implications[], metrics[]`;
                break;

            case 'forward':
                prompt = `Given this policy scenario: "${sourceTitle}" - ${sourceDescription}

Current implications: ${implications?.join(', ') || 'None specified'}
Current metrics: ${metrics?.join(', ') || 'None specified'}

Generate 3 future scenarios that could result from implementing this policy. Consider long-term consequences, unintended effects, and evolution over time. For each scenario, provide:
1. A clear, concise title
2. A brief description (2-3 sentences)
3. 2-3 key implications
4. 2-3 success metrics

Format as JSON array with objects containing: title, description, implications[], metrics[]`;
                break;

            case 'backward':
                prompt = `Given this policy scenario: "${sourceTitle}" - ${sourceDescription}

Current implications: ${implications?.join(', ') || 'None specified'}
Current metrics: ${metrics?.join(', ') || 'None specified'}

Generate 3 root cause scenarios that could have led to the need for this policy. Consider underlying problems, systemic issues, and historical factors. For each scenario, provide:
1. A clear, concise title
2. A brief description (2-3 sentences)
3. 2-3 key implications
4. 2-3 success metrics

Format as JSON array with objects containing: title, description, implications[], metrics[]`;
                break;

            default:
                throw new Error('Invalid action type');
        }

        // Use Google Gemini AI setup
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY || ""
        });

        const result = await generateText({
            model: google("gemini-2.0-flash"),
            prompt: `You are a policy scenario generator. Generate realistic, well-researched policy scenarios. Always respond with valid JSON only, no additional text.

${prompt}`,
            temperature: 0.8,
            maxTokens: 1000,
        });

        const aiResponse = result.text;

        // Parse the AI response
        let scenarios;
        try {
            scenarios = JSON.parse(aiResponse);
        } catch (parseError) {
            // Fallback to mock data if parsing fails
            console.error('Failed to parse AI response:', parseError);
            scenarios = generateFallbackScenarios(sourceTitle, action);
        }

        return NextResponse.json({ scenarios });

    } catch (error) {
        console.error('Error generating scenarios:', error);

        // Return fallback scenarios on error using the already parsed values
        const fallbackScenarios = generateFallbackScenarios(sourceTitle, action);

        return NextResponse.json({ scenarios: fallbackScenarios });
    }
}

function generateFallbackScenarios(sourceTitle: string, action: string) {
    const actionType = action === 'branch' ? 'Alternative' : action === 'forward' ? 'Future' : 'Root Cause';

    return [
        {
            title: `${actionType} Approach: Stakeholder-Driven Solution`,
            description: `A ${action} scenario focusing on multi-stakeholder engagement and collaborative policy development based on "${sourceTitle}".`,
            implications: [
                `Enhanced stakeholder buy-in and support`,
                `Potential for more comprehensive policy outcomes`,
                `Increased implementation complexity`
            ],
            metrics: [
                `Stakeholder satisfaction score`,
                `Policy adoption rate`,
                `Implementation timeline adherence`
            ]
        },
        {
            title: `${actionType} Approach: Technology-Enhanced Implementation`,
            description: `A ${action} scenario leveraging digital tools and data-driven approaches to enhance the effectiveness of "${sourceTitle}".`,
            implications: [
                `Improved policy monitoring and evaluation`,
                `Enhanced citizen engagement through digital platforms`,
                `Potential digital divide concerns`
            ],
            metrics: [
                `Digital engagement metrics`,
                `Policy effectiveness indicators`,
                `Cost-benefit ratio`
            ]
        },
        {
            title: `${actionType} Approach: Phased Implementation Strategy`,
            description: `A ${action} scenario implementing "${sourceTitle}" through carefully planned phases with continuous feedback and adjustment.`,
            implications: [
                `Reduced implementation risk`,
                `Opportunity for iterative improvement`,
                `Extended timeline for full benefits`
            ],
            metrics: [
                `Phase completion rates`,
                `Stakeholder feedback scores`,
                `Policy impact measurements`
            ]
        }
    ];
}