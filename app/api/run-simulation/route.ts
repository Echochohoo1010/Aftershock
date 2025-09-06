import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
    try {
        console.log('Starting Python simulation...')
        
        // Path to the Python simulation script
        const pythonScriptPath = '/Users/echohuang/Documents/Explanatory policy /Prototype code/netherlands_carbon_pricing_simulation.py'
        
        // Run the Python simulation
        const simulationResult = await runPythonSimulation(pythonScriptPath)
        
        if (!simulationResult.success) {
            throw new Error(simulationResult.error)
        }
        
        // Find and read the generated XLSX file
        const xlsxData = await readSimulationXLSX()
        
        // Convert XLSX data to agent format
        const agentData = convertXLSXToAgents(xlsxData)
        
        return NextResponse.json({
            success: true,
            agents: agentData.agents,
            frames: agentData.frames,
            simulationOutput: simulationResult.output
        })
        
    } catch (error) {
        console.error('Simulation error:', error)
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error',
                fallbackData: generateFallbackData()
            }, 
            { status: 500 }
        )
    }
}

async function runPythonSimulation(scriptPath: string): Promise<{success: boolean, output?: string, error?: string}> {
    return new Promise((resolve) => {
        console.log('Executing Python script:', scriptPath)
        
        const pythonProcess = spawn('python3', [scriptPath], {
            cwd: path.dirname(scriptPath)
        })
        
        let output = ''
        let errorOutput = ''
        
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
            console.log('Python stdout:', data.toString())
        })
        
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString()
            console.log('Python stderr:', data.toString())
        })
        
        pythonProcess.on('close', (code) => {
            console.log(`Python process exited with code ${code}`)
            if (code === 0) {
                resolve({ success: true, output })
            } else {
                resolve({ success: false, error: `Process exited with code ${code}: ${errorOutput}` })
            }
        })
        
        pythonProcess.on('error', (error) => {
            console.error('Failed to start Python process:', error)
            resolve({ success: false, error: error.message })
        })
        
        // Set timeout (5 minutes)
        setTimeout(() => {
            pythonProcess.kill()
            resolve({ success: false, error: 'Simulation timeout (5 minutes)' })
        }, 5 * 60 * 1000)
    })
}

async function readSimulationXLSX(): Promise<any> {
    // Look for simulation files in both locations
    const possiblePaths = [
        '/Users/echohuang/Documents/Explanatory policy /netherlands_simulation_100_agents.xlsx',
        '/Users/echohuang/Documents/Explanatory policy /Prototype code/netherlands_simulation_100_agents.xlsx'
    ]
    
    let xlsxFile = null
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            xlsxFile = {
                path: filePath,
                stats: fs.statSync(filePath)
            }
            break
        }
    }
    
    if (!xlsxFile) {
        // Look for any XLSX files in the directories
        const dirs = [
            '/Users/echohuang/Documents/Explanatory policy /',
            '/Users/echohuang/Documents/Explanatory policy /Prototype code'
        ]
        
        for (const dir of dirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir)
                const xlsxFiles = files.filter(file => 
                    file.endsWith('.xlsx') && 
                    (file.includes('netherlands') || file.includes('simulation'))
                )
                
                if (xlsxFiles.length > 0) {
                    const mostRecent = xlsxFiles
                        .map(file => ({
                            path: path.join(dir, file),
                            stats: fs.statSync(path.join(dir, file))
                        }))
                        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime())[0]
                    
                    xlsxFile = mostRecent
                    break
                }
            }
        }
    }
    
    if (!xlsxFile) {
        throw new Error('No simulation XLSX files found')
    }
    
    console.log('Reading XLSX file:', xlsxFile.path)
    
    try {
        // Check if file exists and is readable
        if (!fs.existsSync(xlsxFile.path)) {
            throw new Error(`File does not exist: ${xlsxFile.path}`)
        }
        
        // Read the XLSX file
        const workbook = XLSX.readFile(xlsxFile.path)
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('No sheets found in XLSX file')
        }
        
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        if (!worksheet) {
            throw new Error(`Sheet '${sheetName}' not found`)
        }
        
        const data = XLSX.utils.sheet_to_json(worksheet)
        
        console.log(`Loaded ${data.length} rows from XLSX`)
        if (data.length > 0) {
            console.log('Sample data:', data.slice(0, 2))
            console.log('Columns:', Object.keys(data[0] as object))
        }
        
        return data
    } catch (error) {
        console.error('Error reading XLSX file:', error)
        throw error
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
    
    // Sample first 24 months for better performance
    const samplePeriods = sortedPeriods.slice(0, 24)
    
    // Generate frames from time periods
    const frames = samplePeriods.map((period, index) => {
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
    console.log('Sample agent data:', agents[0])
    console.log('Sample frame data:', frames[0]?.agents?.slice(0, 3))
    
    return { agents, frames }
}

function generateFallbackData() {
    // Return fallback data in case simulation fails
    const numAgents = 50
    const agents = Array.from({ length: numAgents }, (_, i) => ({
        id: i,
        initialType: "Mid Petrol Cars",
        adoptionThreshold: Math.random(),
        influence: 1 + Math.random() * 2,
        resistance: Math.random(),
        networkConnections: Math.floor(Math.random() * 5) + 2,
        activity: Math.random() * 3 + 1,
        name: `Agent ${i + 1}`
    }))
    
    const frames = Array.from({ length: 24 }, (_, frame) => ({
        t: `Month ${frame + 1}`,
        agents: agents.map(agent => ({
            ...agent,
            type: agent.initialType
        })),
        adoptionRate: 0
    }))
    
    return { agents, frames }
}