"use client"

import { Document, Page, Text, View, StyleSheet, pdf, Canvas, Font } from '@react-pdf/renderer'



// Define the data structure for the PDF report
export interface PolicyReportData {
    policyTitle: string
    policyDescription: string
    variables: string[]
    relationships: Array<{
        from: string
        to: string
        strength: number
        type: "positive" | "negative" | "complex"
    }>
    events: Array<{
        id: string
        title: string
        description: string
        type: "positive" | "negative" | "neutral" | "alert"
        timestamp: Date
        magnitude: number
    }>
    chatHistory: Array<{
        role: string
        content: string
    }>
    generatedAt: Date
    causalGraphImage?: string // Base64 encoded image of the causal graph
}


// PDF styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,

    },
    subtitle: {
        fontSize: 18,
        marginBottom: 5,
    },
    timestamp: {
        fontSize: 10,
        color: '#666666',
    },
    section: {
        marginBottom: 25,

    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingBottom: 5,
    },
    text: {
        fontSize: 11,
        lineHeight: 1.5,
        marginBottom: 8,
    },
    boldText: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    variableContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    variableTag: {
        backgroundColor: '#F0F0F0',
        padding: 4,
        margin: 2,
        borderRadius: 3,
        fontSize: 9,
    },
    relationship: {
        backgroundColor: '#F9F9F9',
        padding: 8,
        marginBottom: 5,
        borderRadius: 3,
    },
    event: {
        padding: 10,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#CCCCCC',
    },
    eventPositive: {
        borderLeftColor: '#22C55E',
    },
    eventNegative: {
        borderLeftColor: '#EF4444',
    },
    eventAlert: {
        borderLeftColor: '#F59E0B',
    },
    eventNeutral: {
        borderLeftColor: '#6B7280',
    },
    chatMessage: {
        backgroundColor: '#F8F9FA',
        padding: 8,
        marginBottom: 8,
        borderRadius: 3,
    },
    list: {
        marginLeft: 15,
    },
    listItem: {
        fontSize: 11,
        marginBottom: 5,
    },
    chartContainer: {
        marginVertical: 20,
        height: 200,
        width: '100%',
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 150,
        marginBottom: 10,
    },
    bar: {
        marginRight: 5,
        backgroundColor: '#3B82F6',
        minWidth: 20,
    },
    barNegative: {
        backgroundColor: '#EF4444',
    },
    barPositive: {
        backgroundColor: '#22C55E',
    },
    chartLabel: {
        fontSize: 8,
        textAlign: 'center',
        marginTop: 5,
        transform: 'rotate(-45deg)',
    },
    chartTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    graphImage: {
        width: '100%',
        height: 300,
        marginVertical: 10,
    },
})

// Helper function to parse markdown-style bold text
const parseText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <Text key={index} style={styles.boldText}>
                    {part.slice(2, -2)}
                </Text>
            )
        }
        return part
    })
}

// Bar Chart Component for Relationships
const RelationshipChart = ({ relationships }: { relationships: PolicyReportData['relationships'] }) => {
    const topRelationships = relationships
        .sort((a, b) => Math.abs(b.strength) - Math.abs(a.strength))
        .slice(0, 8)

    const maxStrength = Math.max(...topRelationships.map(r => Math.abs(r.strength)))

    return (
        <View style={styles.chartContainer}  >
            <Text style={styles.chartTitle}>Top Relationship Strengths</Text>
            <View style={styles.barChart}>
                {topRelationships.map((rel, index) => {
                    const height = (Math.abs(rel.strength) / maxStrength) * 120
                    return (
                        <View key={index}>
                            <View
                                style={[
                                    styles.bar,
                                    { height: height },
                                    rel.strength > 0 ? styles.barPositive : styles.barNegative,
                                ]}
                            />
                            <Text style={styles.chartLabel}>
                                {rel.from.replace(/_/g, ' ').substring(0, 8)}...
                            </Text>
                            <Text style={[styles.chartLabel, { fontSize: 6 }]}>
                                {rel.strength.toFixed(2)}
                            </Text>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

// PDF Document Component
const PolicyReportDocument = ({ data }: { data: PolicyReportData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Policy Analysis Report</Text>
                <Text style={styles.subtitle}>{data.policyTitle}</Text>
                <Text style={styles.timestamp}>
                    Generated: {data.generatedAt.toLocaleString()}
                </Text>
            </View>

            {/* Policy Overview */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Policy Overview</Text>
                <Text style={styles.boldText}>Title: {data.policyTitle}</Text>
                <Text style={styles.text}>Description: {data.policyDescription}</Text>
            </View>

            {/* Causal Analysis */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Causal Analysis (Explore I)</Text>
                <Text style={styles.boldText}>Variables Analyzed:</Text>
                <View style={styles.variableContainer}>
                    {data.variables.map((variable, index) => (
                        <Text key={index} style={styles.variableTag}>
                            {variable.replace(/_/g, ' ')}
                        </Text>
                    ))}
                </View>

                {/* Relationship Strength Chart */}
                <RelationshipChart relationships={data.relationships} />

                <Text style={styles.boldText}>Key Relationships:</Text>
                {data.relationships.slice(0, 6).map((rel, index) => (
                    <View key={index} style={styles.relationship}>
                        <Text style={styles.text}>
                            {rel.from.replace(/_/g, ' ')} → {rel.to.replace(/_/g, ' ')}
                            ({rel.type}, strength: {rel.strength.toFixed(2)})
                        </Text>
                    </View>
                ))}

                <Text style={styles.boldText}>Analysis Summary:</Text>
                <Text style={styles.text}>
                    The causal graph reveals {data.relationships.filter(r => Math.abs(r.strength) > 0.6).length} strong
                    relationships out of {data.relationships.length} total connections.
                    {data.relationships.filter(r => r.type === "positive").length >
                        data.relationships.filter(r => r.type === "negative").length ?
                        ' The majority of relationships are positive, suggesting favorable policy outcomes.' :
                        ' The relationships show mixed effects, requiring careful monitoring during implementation.'}
                </Text>
            </View>
        </Page>

        <Page size="A4" style={styles.page}>
            {/* Causal Graph Visualization */}
            {data.causalGraphImage && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Causal Graph Visualization</Text>
                    <Canvas
                        style={styles.graphImage}
                        paint={(painter, availableWidth, availableHeight) => {
                            // This would render the causal graph image
                            // Note: react-pdf has limitations with images, you might need to use a different approach
                            painter.image(data.causalGraphImage!, 0, 0, availableWidth, availableHeight)
                        }}
                    />
                </View>
            )}

            {/* Chain Reaction Analysis */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chain Reaction Analysis (Explore II)</Text>
                <Text style={styles.boldText}>Recent Events:</Text>
                {data.events.length > 0 ? (
                    data.events.slice(0, 6).map((event, index) => (
                        <View
                            key={index}
                            style={[
                                styles.event,
                                event.type === 'positive' && styles.eventPositive,
                                event.type === 'negative' && styles.eventNegative,
                                event.type === 'alert' && styles.eventAlert,
                                event.type === 'neutral' && styles.eventNeutral,
                            ]}
                        >
                            <Text style={styles.boldText}>{event.title}</Text>
                            <Text style={styles.text}>{event.description}</Text>
                            <Text style={styles.text}>
                                Impact Magnitude: {Math.round(event.magnitude)}% | Type: {event.type}
                            </Text>
                            <Text style={styles.timestamp}>
                                {event.timestamp.toLocaleString()}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.text}>
                        No chain reaction events recorded yet. Events will appear as the policy analysis runs.
                    </Text>
                )}
            </View>
        </Page>

        <Page size="A4" style={styles.page}>
            {/* Policy Assistant Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Policy Assistant Insights</Text>
                {data.chatHistory.length > 0 ? (
                    <>
                        <Text style={styles.boldText}>Key Discussion Points:</Text>
                        {data.chatHistory.slice(-6).map((msg, index) => (
                            <View key={index} style={styles.chatMessage}>
                                <Text style={styles.boldText}>
                                    {msg.role === 'user' ? 'Question' : 'Analysis'}:
                                </Text>
                                <Text style={styles.text}>
                                    {parseText(msg.content)}
                                </Text>
                            </View>
                        ))}
                    </>
                ) : (
                    <Text style={styles.text}>
                        No chat history available. Interact with the Policy Assistant to generate insights.
                    </Text>
                )}
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <Text style={styles.text}>
                    Based on the integrated analysis of causal relationships and chain reactions:
                </Text>
                <View style={styles.list}>
                    <Text style={styles.listItem}>
                        • Monitor {data.variables[0]?.replace(/_/g, ' ')} as a key leverage point
                    </Text>
                    <Text style={styles.listItem}>
                        • Pay attention to {data.relationships.filter(r => r.type === "negative").length > 0 ?
                            'potential negative feedback loops' : 'positive reinforcement mechanisms'}
                    </Text>
                    <Text style={styles.listItem}>
                        • Consider the temporal dynamics revealed in chain reactions for implementation timing
                    </Text>
                    <Text style={styles.listItem}>
                        • Focus on variables with high connectivity in the causal graph for maximum impact
                    </Text>
                </View>
            </View>

            {/* Technical Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Technical Details</Text>
                <Text style={styles.text}>Analysis Method: Integrated Causal Modeling and Chain Reaction Simulation</Text>
                <Text style={styles.text}>Variables Count: {data.variables.length}</Text>
                <Text style={styles.text}>Relationships Count: {data.relationships.length}</Text>
                <Text style={styles.text}>Events Tracked: {data.events.length}</Text>
                <Text style={styles.text}>Report Generated: {data.generatedAt.toLocaleString()}</Text>
            </View>
        </Page>
    </Document>
)

// Function to generate and download the PDF
export const generatePolicyPDF = async (data: PolicyReportData) => {
    try {
        const blob = await pdf(<PolicyReportDocument data={data} />).toBlob()

        // Create download link
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `policy-analysis-${data.policyTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error generating PDF:', error)
        throw error
    }
}
