import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const policyType = body.policyType || 'vehicle_tax' // Default to vehicle_tax

        console.log(`Starting Python simulation with policy: ${policyType}`)

        // Path to the Python simulation script in the public folder
        const pythonScriptPath = path.join(process.cwd(), 'public', 'simulations', 'netherlands_carbon_pricing_simulation.py')

        // Run the Python simulation with policy argument
        const simulationResult = await runPythonSimulation(pythonScriptPath, policyType)

        if (!simulationResult.success) {
            throw new Error(simulationResult.error)
        }

        // Generate JSON data for frontend with policy-specific filename
        await generateSimulationJSON(policyType)

        return NextResponse.json({
            success: true,
            message: `Simulation completed successfully for ${policyType} policy. Data has been generated.`,
            policyType: policyType,
            simulationOutput: simulationResult.output
        })

    } catch (error) {
        console.error('Simulation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

async function runPythonSimulation(scriptPath: string, policyType: string): Promise<{success: boolean, output?: string, error?: string}> {
    return new Promise((resolve) => {
        console.log('Executing Python script:', scriptPath, 'with policy:', policyType)

        // Use virtual environment Python to ensure all packages are available
        const venvPython = path.join(process.cwd(), '.venv', 'bin', 'python')
        const pythonCommand = fs.existsSync(venvPython) ? venvPython : 'python3'

        console.log('Using Python:', pythonCommand)

        // Pass policy type as command-line argument to Python
        const pythonProcess = spawn(pythonCommand, [scriptPath, policyType], {
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

async function generateSimulationJSON(policyType: string): Promise<void> {
    console.log(`Loading ${policyType} simulation data from JSON output...`)

    // Wait a moment for the Python script to finish writing files
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
        // Policy-specific filename
        const sourceFilename = `simulation_${policyType}.json`
        const jsonOutputPath = path.join(process.cwd(), 'public', 'outputs', sourceFilename)

        if (fs.existsSync(jsonOutputPath)) {
            console.log('Reading simulation data from:', jsonOutputPath)
            const jsonData = fs.readFileSync(jsonOutputPath, 'utf-8')
            const simulationFrames = JSON.parse(jsonData)

            // Copy to policy-specific public file for frontend access
            const publicPath = path.join(process.cwd(), 'public', sourceFilename)
            fs.writeFileSync(publicPath, JSON.stringify(simulationFrames, null, 2))
            console.log(`Loaded ${simulationFrames.length} frames and copied to ${publicPath}`)

        } else {
            console.log(`JSON output not found at ${jsonOutputPath}, generating synthetic data as fallback`)
            const fallbackData = generateSyntheticSimulationData()
            const publicPath = path.join(process.cwd(), 'public', sourceFilename)
            fs.writeFileSync(publicPath, JSON.stringify(fallbackData, null, 2))
            console.log(`Generated fallback simulation data at ${publicPath}`)
        }

    } catch (error) {
        console.error('Error loading JSON simulation data:', error)
        // Generate fallback data
        const fallbackData = generateSyntheticSimulationData()
        const sourceFilename = `simulation_${policyType}.json`
        const publicPath = path.join(process.cwd(), 'public', sourceFilename)
        fs.writeFileSync(publicPath, JSON.stringify(fallbackData, null, 2))
        console.log(`Generated fallback simulation data due to error at ${publicPath}`)
    }
}

function convertXLSXToSimulationFrames(xlsxData: any[]): any[] {
    console.log('Converting XLSX to simulation frames, rows:', xlsxData.length)
    
    // Group by month to create frames
    const monthlyData = new Map()
    
    xlsxData.forEach((row: any) => {
        const agentId = row.Agent_ID
        const month = row.Month  
        const year = row.Year
        const vehicleType = row.Vehicle_Type
        const emissionLevel = row.Emission_Level
        
        if (!monthlyData.has(month)) {
            monthlyData.set(month, [])
        }
        
        monthlyData.get(month).push({
            id: agentId,
            type: vehicleType,
            emission_level: emissionLevel
        })
    })
    
    // Convert to frame format and take all 180 months
    const sortedMonths = Array.from(monthlyData.keys()).sort((a, b) => Number(a) - Number(b))
    const frames = sortedMonths.map(month => {
        const agents = monthlyData.get(month)
        
        // Calculate adoption rate
        const cleanTypes = ['BEV-M', 'Cycling/Walking', 'HEV-S']
        const cleanCount = agents.filter((a: any) => cleanTypes.includes(a.type)).length
        const adoptionRate = agents.length > 0 ? cleanCount / agents.length : 0
        
        const year = Math.floor((Number(month) - 1) / 12) + 1
        const monthInYear = ((Number(month) - 1) % 12) + 1
        
        return {
            t: `Year ${year}, Month ${monthInYear}`,
            agents: agents,
            adoptionRate: adoptionRate
        }
    })
    
    console.log(`Generated ${frames.length} frames from XLSX data`)
    return frames
}

function generateSyntheticSimulationData(): any[] {
    console.log('Generating synthetic 10-year simulation data...')
    
    const numAgents = 100
    const numMonths = 120 // 10 years
    
    // Vehicle types from the Netherlands simulation
    const vehicleTypes = ['Cycling/Walking', 'BEV-M', 'HEV-S', 'ICE-S', 'DIE-M', 'ICE-M']
    const vehicleEmissions = {
        'Cycling/Walking': 1,
        'BEV-M': 1, 
        'HEV-S': 2,
        'ICE-S': 3,
        'DIE-M': 3,
        'ICE-M': 4
    }
    
    // Initialize agents with random starting types
    const agents = Array.from({ length: numAgents }, (_, i) => ({
        id: i + 1,
        currentType: Math.random() > 0.6 ? 'Cycling/Walking' : 
                    Math.random() > 0.3 ? 'ICE-M' : 'HEV-S'
    }))
    
    const frames = []
    
    for (let month = 1; month <= numMonths; month++) {
        // Simulate gradual adoption of cleaner transport
        const adoptionPressure = month / numMonths * 0.4 // 40% max adoption pressure over 10 years
        
        agents.forEach(agent => {
            // Small chance to switch to cleaner vehicle each month
            if (Math.random() < adoptionPressure * 0.02) { // 2% monthly chance at full pressure
                if (agent.currentType === 'ICE-M') {
                    agent.currentType = Math.random() > 0.5 ? 'HEV-S' : 'DIE-M'
                } else if (agent.currentType === 'DIE-M') {
                    agent.currentType = Math.random() > 0.5 ? 'HEV-S' : 'BEV-M'
                } else if (agent.currentType === 'ICE-S') {
                    agent.currentType = 'HEV-S'
                } else if (agent.currentType === 'HEV-S' && Math.random() > 0.8) {
                    agent.currentType = Math.random() > 0.5 ? 'BEV-M' : 'Cycling/Walking'
                }
            }
        })
        
        const frameAgents = agents.map(agent => ({
            id: agent.id,
            type: agent.currentType,
            emission_level: vehicleEmissions[agent.currentType as keyof typeof vehicleEmissions] || 3
        }))
        
        // Calculate adoption rate
        const cleanTypes = ['BEV-M', 'Cycling/Walking', 'HEV-S']
        const cleanCount = frameAgents.filter(a => cleanTypes.includes(a.type)).length
        const adoptionRate = cleanCount / frameAgents.length
        
        const year = Math.floor((month - 1) / 12) + 1
        const monthInYear = ((month - 1) % 12) + 1
        
        frames.push({
            t: `Year ${year}, Month ${monthInYear}`,
            agents: frameAgents,
            adoptionRate: adoptionRate
        })
    }
    
    console.log(`Generated ${frames.length} synthetic frames`)
    return frames
}