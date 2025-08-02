"use client"

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { StoryNode } from '@/lib/universe'

// Define the data structure for the story PDF report
export interface StoryReportData {
    scenarioTitle: string
    scenarioDescription: string
    currentNode: StoryNode
    storyPath: StoryNode[]
    worldStateProgression: Array<{
        nodeTitle: string
        time: number
        compute: number
        unemployment: number
        geopolitics: string
    }>
    availableChoices: Array<{
        description: string
        consequenceText?: string
        impact: {
            compute?: number
            unemployment?: number
            geopolitics?: string
        }
    }>
    generatedAt: Date
}

// PDF styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#3B82F6',
        paddingBottom: 20,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 5,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 5,
    },
    text: {
        fontSize: 11,
        lineHeight: 1.5,
        color: '#374151',
        marginBottom: 8,
    },
    worldStateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#F9FAFB',
        borderRadius: 5,
    },
    worldStateItem: {
        alignItems: 'center',
        flex: 1,
    },
    worldStateValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    worldStateLabel: {
        fontSize: 9,
        color: '#6B7280',
        marginTop: 2,
    },
    pathContainer: {
        marginBottom: 15,
    },
    pathItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#EFF6FF',
        borderRadius: 4,
    },
    pathNumber: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 20,
        marginRight: 10,
    },
    pathTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
    },
    choiceContainer: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 5,
        borderLeftWidth: 3,
        borderLeftColor: '#6366F1',
    },
    choiceTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 5,
    },
    choiceConsequence: {
        fontSize: 10,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 5,
    },
    choiceImpact: {
        fontSize: 9,
        color: '#374151',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 9,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
})

// PDF Document Component
const StoryPDFDocument = ({ data }: { data: StoryReportData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Future Scenario Analysis Report</Text>
                <Text style={styles.subtitle}>{data.scenarioTitle}</Text>
                <Text style={styles.subtitle}>
                    Generated on {data.generatedAt.toLocaleDateString()} at {data.generatedAt.toLocaleTimeString()}
                </Text>
            </View>

            {/* Current Scenario */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Scenario: {data.currentNode.title}</Text>
                <Text style={styles.text}>{data.currentNode.content}</Text>
            </View>

            {/* World State */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current World State</Text>
                <View style={styles.worldStateContainer}>
                    <View style={styles.worldStateItem}>
                        <Text style={styles.worldStateValue}>T+{data.currentNode.worldState.t}</Text>
                        <Text style={styles.worldStateLabel}>Months</Text>
                    </View>
                    <View style={styles.worldStateItem}>
                        <Text style={styles.worldStateValue}>
                            {data.currentNode.worldState.compute > 0 ? '+' : ''}{data.currentNode.worldState.compute}%
                        </Text>
                        <Text style={styles.worldStateLabel}>Compute Change</Text>
                    </View>
                    <View style={styles.worldStateItem}>
                        <Text style={styles.worldStateValue}>
                            {data.currentNode.worldState.unemployment > 0 ? '+' : ''}{data.currentNode.worldState.unemployment}%
                        </Text>
                        <Text style={styles.worldStateLabel}>Unemployment Change</Text>
                    </View>
                </View>
                <Text style={styles.text}>
                    <Text style={{ fontWeight: 'bold' }}>Geopolitical Status: </Text>
                    {data.currentNode.worldState.geopolitics}
                </Text>
            </View>

            {/* Decision Path */}
            {data.storyPath.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Decision Path</Text>
                    <View style={styles.pathContainer}>
                        {data.storyPath.map((node, index) => (
                            <View key={node.id} style={styles.pathItem}>
                                <Text style={styles.pathNumber}>{index + 1}</Text>
                                <Text style={styles.pathTitle}>{node.title}</Text>
                            </View>
                        ))}
                        <View style={[styles.pathItem, { backgroundColor: '#DBEAFE' }]}>
                            <Text style={[styles.pathNumber, { backgroundColor: '#1D4ED8' }]}>
                                {data.storyPath.length + 1}
                            </Text>
                            <Text style={styles.pathTitle}>{data.currentNode.title} (Current)</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Available Choices */}
            {data.availableChoices.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Available Future Paths</Text>
                    {data.availableChoices.map((choice, index) => (
                        <View key={index} style={styles.choiceContainer}>
                            <Text style={styles.choiceTitle}>
                                Option {index + 1}: {choice.description}
                            </Text>
                            {choice.consequenceText && (
                                <Text style={styles.choiceConsequence}>
                                    {choice.consequenceText}
                                </Text>
                            )}
                            <Text style={styles.choiceImpact}>
                                Impact:
                                {choice.impact.compute && ` Compute ${choice.impact.compute > 0 ? '+' : ''}${choice.impact.compute}%`}
                                {choice.impact.unemployment && ` | Unemployment ${choice.impact.unemployment > 0 ? '+' : ''}${choice.impact.unemployment}%`}
                                {choice.impact.geopolitics && ` | ${choice.impact.geopolitics}`}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* World State Progression */}
            {data.worldStateProgression.length > 1 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>World State Evolution</Text>
                    {data.worldStateProgression.map((state, index) => (
                        <View key={index} style={[styles.pathItem, { marginBottom: 5 }]}>
                            <Text style={styles.pathNumber}>{index + 1}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pathTitle}>{state.nodeTitle}</Text>
                                <Text style={[styles.text, { fontSize: 9, marginBottom: 0 }]}>
                                    T+{state.time} | Compute: {state.compute > 0 ? '+' : ''}{state.compute}% |
                                    Unemployment: {state.unemployment > 0 ? '+' : ''}{state.unemployment}%
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Footer */}
            <Text style={styles.footer}>
                Predictive History- Policy Scenario Analysis Tool | Generated by AI-powered branching narratives
            </Text>
        </Page>
    </Document>
)

// Export function to generate and download PDF
export const generateStoryPDF = async (data: StoryReportData) => {
    const blob = await pdf(<StoryPDFDocument data={data} />).toBlob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `story-scenario-${data.scenarioTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export default StoryPDFDocument