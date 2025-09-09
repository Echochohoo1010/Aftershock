import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
    try {
        const { simulationData } = await request.json()
        
        if (!simulationData || !simulationData.agents || !simulationData.frames) {
            return NextResponse.json({ 
                success: false, 
                error: 'Invalid simulation data provided' 
            }, { status: 400 })
        }
        
        // Update the JSON file that the frontend loads
        const jsonFilePath = path.join(process.cwd(), 'public', 'simulation_data.json')
        
        await fs.promises.writeFile(jsonFilePath, JSON.stringify(simulationData, null, 2))
        
        console.log(`Updated simulation JSON file with ${simulationData.agents.length} agents and ${simulationData.frames.length} frames`)
        
        return NextResponse.json({
            success: true,
            message: 'Simulation JSON updated successfully'
        })
        
    } catch (error) {
        console.error('Error updating simulation JSON:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // Regenerate simulation data from the latest XLSX file and update JSON
        console.log('Regenerating simulation JSON from latest XLSX...')
        
        const result = await regenerateSimulationJSON()
        
        if (result.success) {
            return NextResponse.json(result)
        } else {
            return NextResponse.json(result, { status: 500 })
        }
        
    } catch (error) {
        console.error('Error regenerating simulation JSON:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error'
            }, 
            { status: 500 }
        )
    }
}

async function regenerateSimulationJSON() {
    return new Promise((resolve) => {
        const pythonScript = `
import pandas as pd
import json
import sys

try:
    # Load simulation data
    df = pd.read_excel('/Users/echohuang/Documents/Explanatory policy /netherlands_simulation_100_agents.xlsx')

    # Group by agent to get initial data and create agent profiles
    agents = []
    for agent_id in range(100):
        agent_data = df[df['Agent_ID'] == agent_id].sort_values('Month')
        if len(agent_data) > 0:
            initial_data = agent_data.iloc[0]
            agents.append({
                'id': int(agent_id),
                'initialType': str(initial_data['Vehicle_Type']),
                'adoptionThreshold': 0.5,
                'influence': 2.0,
                'resistance': 0.3,
                'networkConnections': 4,
                'activity': 2.0,
                'name': f'Agent {agent_id}'
            })

    # Create frames for all 180 months (15 years)
    frames = []
    for month in range(180):
        month_data = df[df['Month'] == month]
        if len(month_data) > 0:
            frame_agents = []
            for _, row in month_data.iterrows():
                frame_agents.append({
                    'id': int(row['Agent_ID']),
                    'type': str(row['Vehicle_Type']),
                    'emissionLevel': int(row['Emission_Level']),
                    'influence': 2.0,
                    'activity': 2.0,
                    'name': f'Agent {int(row["Agent_ID"])}'
                })
            
            # Calculate clean transport adoption
            clean_count = len([a for a in frame_agents if a['type'] in ['BEV-M', 'Cycling/Walking', 'HEV-S']])
            adoption_rate = clean_count / len(frame_agents) if len(frame_agents) > 0 else 0
            
            year = month // 12 + 1
            month_in_year = month % 12 + 1
            
            frames.append({
                't': f'Year {year}, Month {month_in_year}',
                'agents': frame_agents,
                'adoptionRate': adoption_rate
            })

    # Create the final data structure
    simulation_data = {
        'success': True,
        'agents': agents,
        'frames': frames,
        'dataSource': 'latest_simulation',
        'generatedAt': pd.Timestamp.now().isoformat()
    }

    # Save to JSON
    with open('/Users/echohuang/Documents/Explanatory policy /exploratory-policy/public/simulation_data.json', 'w') as f:
        json.dump(simulation_data, f, indent=2)

    print(f"SUCCESS: Generated {len(agents)} agents, {len(frames)} frames")

except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
`
        
        const pythonProcess = spawn('python3', ['-c', pythonScript])
        
        let output = ''
        let errorOutput = ''
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
        })
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString()
        })
        
        pythonProcess.on('close', (code) => {
            if (code === 0 && output.includes('SUCCESS:')) {
                resolve({
                    success: true,
                    message: 'Simulation JSON regenerated successfully',
                    details: output.trim()
                })
            } else {
                resolve({
                    success: false,
                    error: `Python script failed: ${errorOutput || 'Unknown error'}`,
                    output
                })
            }
        })
        
        pythonProcess.on('error', (error) => {
            resolve({
                success: false,
                error: `Failed to start Python process: ${error.message}`
            })
        })
    })
}