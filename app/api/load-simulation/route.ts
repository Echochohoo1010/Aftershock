import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

export async function GET(request: NextRequest) {
    try {
        console.log('Loading existing simulation data...')
        
        // Find and read the existing XLSX file (don't run simulation)
        const xlsxData = await readExistingSimulationXLSX()
        
        if (!xlsxData || xlsxData.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No existing simulation data found',
                needsSimulation: true
            })
        }
        
        // Convert XLSX data to agent format
        const agentData = convertXLSXToAgents(xlsxData)
        
        return NextResponse.json({
            success: true,
            agents: agentData.agents,
            frames: agentData.frames,
            dataSource: 'existing_simulation'
        })
        
    } catch (error) {
        console.error('Error loading simulation data:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                needsSimulation: true
            }, 
            { status: 500 }
        )
    }
}

async function readExistingSimulationXLSX(): Promise<any> {
    // Use the file that gets updated by the simulation
    const filePath = '/Users/echohuang/Documents/Explanatory policy /netherlands_simulation_100_agents.xlsx'
    
    if (!fs.existsSync(filePath)) {
        console.log('No existing simulation file found at:', filePath)
        return null
    }
    
    console.log('Reading existing XLSX file:', filePath)
    
    try {
        // Add a small delay to ensure file is not being written to
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Read the XLSX file
        const workbook = XLSX.readFile(filePath)
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No sheets found in XLSX file')
        }
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        if (!worksheet) {
            throw new Error(`Sheet '${sheetName}' not found`)
        }
        
        const data = XLSX.utils.sheet_to_json(worksheet)
        
        console.log(`Loaded ${data.length} rows from existing simulation`)
        if (data.length > 0) {
            console.log('Sample data:', data.slice(0, 2))
        }
        
        return data
    } catch (error) {
        console.error('Error reading existing XLSX file:', error)
        return null
    }
}

function convertXLSXToAgents(xlsxData: any[]): {agents: any[], frames: any[]} {
    console.log('Converting XLSX data, rows:', xlsxData.length)
    
    // Extract unique agents and time periods from actual simulation data
    const agentMap = new Map()
    const timePeriods = new Set()
    
    xlsxData.forEach((row: any) => {
        const agentId = row.Agent_ID
        const month = row.Month  
        const year = row.Year
        const vehicleType = row.Vehicle_Type
        const emissionLevel = row.Emission_Level
        
        timePeriods.add(month)
        
        if (!agentMap.has(agentId)) {
            agentMap.set(agentId, {
                id: agentId,
                initialType: vehicleType,
                adoptionThreshold: Math.random() * 0.5,
                influence: 1 + Math.random() * 2,
                resistance: Math.random() * 0.5,
                networkConnections: Math.floor(Math.random() * 5) + 2,
                activity: Math.random() * 3 + 1,
                name: `Agent ${agentId}`,
                history: []
            })
        }
        
        // Add time period data with emission level
        agentMap.get(agentId).history.push({
            time: month,
            year: year,
            type: vehicleType,
            emissionLevel: emissionLevel,
            influence: 1 + Math.random(),
            activity: 1 + Math.random()
        })
    })
    
    const agents = Array.from(agentMap.values())
    const sortedPeriods = Array.from(timePeriods).sort((a, b) => Number(a) - Number(b))
    
    // Use first 24 months for better performance, but keep all 180 for full simulation
    const samplePeriods = sortedPeriods.slice(0, Math.min(24, sortedPeriods.length))
    
    // Generate frames from time periods
    const frames = samplePeriods.map((period) => {
        const frameAgents = agents.map(agent => {
            const periodData = agent.history.find((h: any) => h.time === period) || agent.history[0]
            return {
                id: agent.id,
                type: periodData?.type || agent.initialType,
                emissionLevel: periodData?.emissionLevel || 3,
                influence: periodData?.influence || agent.influence,
                activity: periodData?.activity || agent.activity,
                name: agent.name
            }
        })
        
        // Calculate adoption rate based on clean vehicles
        const adoptedCount = frameAgents.filter(a => 
            a.type === 'BEV-M' || 
            a.type === 'Cycling/Walking' || 
            a.type === 'HEV-S'
        ).length
        
        const year = Math.floor(Number(period) / 12) + 1
        const monthInYear = (Number(period) % 12) + 1
        
        return {
            t: `Year ${year}, Month ${monthInYear}`,
            agents: frameAgents,
            adoptionRate: adoptedCount / frameAgents.length
        }
    })
    
    console.log(`Converted ${agents.length} agents with ${frames.length} time frames`)
    
    return { agents, frames }
}