import { NextRequest, NextResponse } from "next/server"
import { StateGraph, START, END } from "@langchain/langgraph"
import { generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

interface GraphState {
  query: string
  response: string
  correlations: Array<{ from: string; to: string; value: number; type: string }>
  variables: string[]
}

export async function POST(req: NextRequest) {
  try {
    const { query, scenario } = await req.json()
    console.log("Received query:", query, "Scenario:", scenario)

    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY || "" })

    const extractCorrelations = (text: string) => {
      const correlations: Array<{ from: string; to: string; value: number; type: string }> = []
      const patterns = [
        /(\w+(?:_\w+)*)\s*→\s*(\w+(?:_\w+)*)\s*(?:strength:|correlation:)?\s*([-]?\d*\.?\d+)/gi,
        /(\w+(?:_\w+)*)\s*to\s*(\w+(?:_\w+)*)\s*:\s*([-]?\d*\.?\d+)/gi,
        /correlation between\s*(\w+(?:_\w+)*)\s*and\s*(\w+(?:_\w+)*)\s*is\s*([-]?\d*\.?\d+)/gi,
      ]
      patterns.forEach((pattern) => {
        let match
        while ((match = pattern.exec(text)) !== null) {
          const [, from, to, valueStr] = match
          const value = Number.parseFloat(valueStr)
          if (!Number.isNaN(value) && Math.abs(value) <= 1) {
            correlations.push({
              from: from.toLowerCase(),
              to: to.toLowerCase(),
              value,
              type: value > 0 ? "positive" : value < 0 ? "negative" : "complex",
            })
          }
        }
      })
      console.log("Extracted correlations:", correlations)
      return correlations
    }

    const graphBuilder = new StateGraph<GraphState>({
      channels: {
        query: { value: null, default: () => "" },
        response: { value: null, default: () => "" },
        correlations: { value: null, default: () => [] },
        variables: { value: null, default: () => [] },
      },
    })

    const reasonNode = async (state: GraphState) => {
      console.log("Entering reason node with state:", state)
      const response = await generateText({
        model: google("gemini-2.0-flash"),
        prompt: `You are an AI policy assistant analyzing the ${scenario.title} scenario. The scenario involves these variables: ${scenario.variables.join(
          ", "
        )}. The user asked: "${state.query}". Provide a concise response addressing the user's query, including:
        - Relevant causal relationships or policy impacts
        - Any correlations (e.g., "variable1 → variable2: 0.8")
        - Causal graph insights
        Format correlations as "variable1 → variable2: value" and ensure values are between -1 and 1.`,
      })

      const correlations = extractCorrelations(response.text)
      const variables = response.text.match(/\b\w+(?:_\w+)*\b/g)?.filter((v) => scenario.variables.includes(v)) || []

      const newState = {
        response: response.text,
        correlations,
        variables,
      }
      console.log("Exiting reason node with new state:", newState)
      return newState
    }

    graphBuilder.addNode("reason", reasonNode)
    graphBuilder.addEdge(START, "reason")
    graphBuilder.addEdge("reason", END)
    const graph = graphBuilder.compile()

    console.log("Invoking graph with initial state:", { query, response: "", correlations: [], variables: [] })
    const result = await graph.invoke({
      query,
      response: "",
      correlations: [],
      variables: [],
    })
    console.log("Graph result:", result)

    const nodes = [...new Set([...scenario.variables, ...result.variables, ...result.correlations.flatMap((c) => [c.from, c.to])])]
    const edges = result.correlations.map((c) => ({ from: c.from, to: c.to, strength: c.value, type: c.type }))

    return NextResponse.json({ ...result, nodes, edges })
  } catch (error) {
    console.error("Reasoning error:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}