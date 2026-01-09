import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

export async function POST(request: NextRequest) {
    try {
        console.log(`Starting Python simulation for BOTH policies (vehicle_tax + fuel_tax)`)

        // Path to the Python simulation script in the public folder
        const pythonScriptPath = path.join(process.cwd(), 'public', 'simulations', 'netherlands_carbon_pricing_simulation.py')

        // Run the Python simulation (now generates both policies)
        const simulationResult = await runPythonSimulation(pythonScriptPath)

        if (!simulationResult.success) {
            throw new Error(simulationResult.error)
        }

        // Verify that both policy data files were generated
        await verifyPolicyDataFiles()

        return NextResponse.json({
            success: true,
            message: `Simulation completed successfully for BOTH policies. All data files have been generated.`,
            policies: ['vehicle_tax', 'fuel_tax'],
            filesGenerated: [
                'simulation_vehicle_tax.json',
                'simulation_fuel_tax.json',
                'monthly_metrics_vehicle_tax.json',
                'monthly_metrics_fuel_tax.json'
            ],
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

async function runPythonSimulation(scriptPath: string): Promise<{success: boolean, output?: string, error?: string}> {
    return new Promise((resolve) => {
        console.log('Executing Python script:', scriptPath, '(generates both policies)')

        // Use virtual environment Python to ensure all packages are available
        const venvPython = path.join(process.cwd(), '.venv', 'bin', 'python')
        const pythonCommand = fs.existsSync(venvPython) ? venvPython : 'python3'

        console.log('Using Python:', pythonCommand)

        // Run without policy argument - script now generates both policies
        const pythonProcess = spawn(pythonCommand, [scriptPath], {
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
        
        // Set timeout (10 minutes for both policies)
        setTimeout(() => {
            pythonProcess.kill()
            resolve({ success: false, error: 'Simulation timeout (10 minutes)' })
        }, 10 * 60 * 1000)
    })
}

async function verifyPolicyDataFiles(): Promise<void> {
    console.log(`Verifying that both policy data files were generated...`)

    // Wait a moment for the Python script to finish writing files
    await new Promise(resolve => setTimeout(resolve, 2000))

    const publicDir = path.join(process.cwd(), 'public')

    const requiredFiles = [
        'simulation_vehicle_tax.json',
        'simulation_fuel_tax.json',
        'monthly_metrics_vehicle_tax.json',
        'monthly_metrics_fuel_tax.json'
    ]

    const missingFiles: string[] = []

    for (const filename of requiredFiles) {
        const filePath = path.join(publicDir, filename)
        if (!fs.existsSync(filePath)) {
            missingFiles.push(filename)
            console.warn(`⚠️ Missing file: ${filename}`)
        } else {
            const stats = fs.statSync(filePath)
            console.log(`✅ Found file: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`)
        }
    }

    if (missingFiles.length > 0) {
        throw new Error(`Missing ${missingFiles.length} required data files: ${missingFiles.join(', ')}`)
    }

    console.log(`✅ All ${requiredFiles.length} policy data files verified`)
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