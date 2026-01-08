# Aftershock

A sophisticated policy simulation and analysis platform that turns complex policy scenarios into interactive, data-driven insights. Designed for policymakers, researchers, and analysts to explore the ripple effects of policy decisions through agent-based modeling and dynamic visualizations.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square&logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Overview

Aftershock provides an interactive canvas for exploring policy interventions through:
- **Agent-Based Simulations**: Model real-world scenarios with thousands of autonomous agents
- **Interactive Visualizations**: Dynamic charts, network graphs, and bubble visualizations
- **Real-Time Analysis**: Adjust parameters and see immediate policy impacts
- **Data-Driven Insights**: Export detailed reports and simulation data

## Documentation

**📚 Full Documentation and Theoretical Analysis**

Access comprehensive documentation, theoretical framework, and detailed analysis:
- [Complete Project Documentation (PDF)](https://drive.google.com/file/d/1F0WemPQNOeLWsN68ZAV4qkjlT8ffFoAT/view?usp=sharing)

The documentation includes:
- Theoretical foundations and research methodology
- Agent-based modeling approach and calibration
- Policy scenario analysis and comparative results
- Technical implementation details
- Validation and sensitivity analysis

## Features

### Policy Simulations
- **Carbon Pricing Models**: Analyze carbon tax implementations across different scenarios
  - **Purchase Tax Policy**: Netherlands-style vehicle purchase tax (BPM) with feebate system
  - **Fuel Tax Policy**: British Columbia-style progressive carbon tax on fuel
  - Agent-based vehicle fleet modeling (6 vehicle types: ICE-S, ICE-M, DIE-M, HEV-S, BEV-M, PHEV-M)
  - 10-year simulation horizon with 100+ household agents
  - Real-time policy comparison and cost-effectiveness analysis
  - Comprehensive monthly metrics tracking (emissions, EV adoption, market shares)

### Visualization Suite
- **Interactive Bubble Canvas**: Real-time agent visualization with physics-based interactions
  - Color-coded vehicle types (Petrol, Diesel, Hybrid, EV/PHEV, Cyclists)
  - Dynamic emission level indicators
  - Smooth 120-frame animation (10-year simulation)
- **Real-Time Analytics Dashboard**:
  - Fleet CO2 trajectory tracking
  - EV adoption curves over time
  - Cost effectiveness metrics (€/tCO2)
  - Market share pie charts with 5 vehicle categories
  - Policy impact bars (vehicle purchase price vs fuel cost)
- **Interactive Timeline Controls**: Play/pause, scrub timeline, restart simulation
- **Policy Toggle Interface**: Switch between Purchase Tax and Fuel Tax scenarios in real-time

### Analysis Tools
- **Parameter Controls**: Fine-tune policy variables with intuitive sliders and inputs
- **Scenario Planning**: Compare multiple policy scenarios side-by-side
- **Data Export**: Download simulation results in JSON and Excel formats
- **Real-Time Updates**: See policy effects update dynamically as you adjust parameters

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TypeScript 5
- **Styling**: Tailwind CSS, Radix UI
- **Animations**: Framer Motion
- **Charts**: D3.js, Recharts
- **3D Graphics**: Three.js, React Three Fiber

### Backend Simulations
- **Language**: Python 3.13
- **Data Analysis**: NumPy, Pandas, SciPy
- **Visualization**: Matplotlib, Seaborn
- **Export**: openpyxl for Excel generation

### AI Integration
- **Models**: Google Gemini AI integration
- **Frameworks**: LangChain, LangGraph
- **SDK**: AI SDK for enhanced reasoning

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.13+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Echochohoo1010/Aftershock.git
cd Aftershock
```

2. Install JavaScript dependencies:
```bash
npm install
```

3. Set up Python environment (optional, for running simulations):
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Quick Start Guide

Once the development server is running:

1. **Navigate to the Carbon Pricing Simulation**:
   - Click "Explore Cases" from the landing page
   - Select "Carbon Tax Implementation" case

2. **Interact with the Simulation**:
   - Press the **Play** button to watch the 10-year simulation unfold
   - Use the **timeline scrubber** to jump to any month (0-120)
   - Toggle between **Purchase tax** and **Fuel tax** policies in real-time
   - Click **Restart** to re-run the simulation with Monte Carlo randomization

3. **Analyze Results**:
   - Watch the bubble visualization show agent vehicle choices
   - Track **Fleet CO2 Trajectory** in the sidebar
   - Monitor **Cost Effectiveness** (€/tCO2 avoided)
   - Click **Expand** to view full analytics dashboard

4. **Access Documentation**:
   - In full dashboard view, click **Download Full Report** for comprehensive analysis

### Environment Variables

Create a `.env.local` file in the root directory:
```env
# Add your API keys here if using AI features
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Project Structure

```
Aftershock/
├── app/                                    # Next.js app router pages
│   ├── api/                                # API routes
│   │   ├── run-simulation/                 # Simulation execution endpoint
│   │   └── generate-story/                 # AI story generation
│   ├── canvas/                             # Simulation canvas page
│   ├── explore/                            # Case selection page
│   └── page.tsx                            # Landing page
├── components/                             # React components
│   ├── core/
│   │   └── AnalysisCanvas.tsx              # Main simulation canvas (control bar here!)
│   ├── features/
│   │   └── visualization/
│   │       └── agents/
│   │           └── PureBubbleCanvas.tsx    # Agent bubble visualization
│   ├── visualizations/                     # Visualization components
│   │   ├── carbon-pricing/                 # Carbon pricing specific viz
│   │   ├── charts/                         # Chart components
│   │   │   ├── SimpleLineChart.tsx         # CO2 trajectory chart
│   │   │   ├── PolicyImpactBar.tsx         # Tax impact visualization
│   │   │   └── ...
│   │   └── shared/                         # Shared viz utilities
│   ├── ui/
│   │   └── CompactToggle.tsx               # Policy toggle buttons
│   └── explore/
│       └── content/
│           └── carbon-tax/                 # Carbon pricing case content
├── lib/                                    # Utility libraries
├── public/                                 # Static assets
│   ├── simulations/
│   │   └── netherlands_carbon_pricing_simulation.py  # Main simulation script
│   ├── simulation_vehicle_tax.json         # Purchase tax scenario data
│   ├── simulation_fuel_tax.json            # Fuel tax scenario data
│   ├── monthly_metrics_vehicle_tax.json    # Purchase tax metrics
│   ├── monthly_metrics_fuel_tax.json       # Fuel tax metrics
│   └── carbon_policy_report.pdf            # Full technical documentation
└── package.json                            # Dependencies and scripts
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Running Simulations

The carbon pricing simulation is located in `public/simulations/`. You can run it with different policy types:

```bash
cd public/simulations

# Run Netherlands-style purchase tax simulation
python netherlands_carbon_pricing_simulation.py vehicle_tax

# Run British Columbia-style fuel tax simulation
python netherlands_carbon_pricing_simulation.py fuel_tax
```

**Simulation Outputs:**
- `simulation_vehicle_tax.json` - Agent data for purchase tax scenario
- `simulation_fuel_tax.json` - Agent data for fuel tax scenario
- `monthly_metrics_vehicle_tax.json` - Comprehensive metrics for purchase tax
- `monthly_metrics_fuel_tax.json` - Comprehensive metrics for fuel tax

These outputs are automatically loaded by the frontend visualizations and can be toggled in real-time using the control bar.

## Simulation Methodology

### CS166 Carbon Pricing Model

The simulation is based on research from:
- **Kok (2015)**: Netherlands vehicle taxation policy impact study
- **Murray & Rivers (2015)**: British Columbia carbon tax analysis

**Key Model Characteristics:**
- **Time Horizon**: 120 months (10 years) with monthly timesteps
- **Population**: 100 heterogeneous household agents
- **Vehicle Types**: 6 archetypes (ICE-S, ICE-M, DIE-M, HEV-S, BEV-M, PHEV-M)
- **Decision Framework**: Utility-based choice with behavioral realism
- **Policy Scenarios**:
  1. **Purchase Tax (Netherlands)**: BPM vehicle purchase tax, feebate system, annual road tax (MRB), company car tax (BIK)
  2. **Fuel Tax (BC Canada)**: Progressive carbon tax on fuel (€6.97 to €20.89/tonne CO2)

**Behavioral Parameters:**
- Upfront cost weight: 1.0
- Annual cost weight: 0.7
- Fuel cost weight: 0.5
- Decision noise: €7,000
- Range anxiety: €3,500 initial, 95% monthly decay
- Initial car ownership: 45.1%

**Outputs:**
- Monthly fleet emissions (tonnes CO2e)
- EV adoption rates (BEV + PHEV)
- Market share by vehicle type
- Cost effectiveness (€/tCO2 avoided)
- Policy costs (subsidies - taxes collected)

## Key Features in Detail

### Agent-Based Modeling
The carbon pricing simulation models 100 heterogeneous household agents with:
- **Income Distribution**: Log-normal distribution calibrated to real-world data
- **Driving Behavior**: Annual kilometers driven (normal distribution, mean 13,000 km)
- **Vehicle Preferences**: Choice among 6 vehicle archetypes with realistic pricing
- **Policy Awareness**: Beta distribution (2, 3) affecting response to incentives
- **Company Car Status**: 50% of agents with enhanced policy awareness
- **Cycling Preference**: Beta distribution influencing car ownership decisions
- **Utility-Based Decision Making**: Total cost of ownership (upfront, annual, fuel costs)
- **Range Anxiety**: Decaying over time (95% decay rate per month) for BEV/PHEV
- **Dynamic Fleet Evolution**: 10-year simulation with monthly vehicle age tracking

### Interactive Canvas
The analysis canvas provides:
- **Real-Time Policy Switching**: Toggle between Purchase Tax and Fuel Tax with live data updates
- **Synchronized Visualizations**: All charts and metrics update together as simulation progresses
- **Timeline Controls**:
  - Play/pause animation (400ms per month)
  - Scrubber for instant time travel (0-120 months)
  - Restart button to re-run simulation
- **Collapsible Dashboard**: Hide/show analytics sidebar and controls for focused viewing
- **Full Analytics View**: Expandable dashboard with comprehensive charts and documentation access
- **Responsive Design**: Optimized for desktop viewing with smooth transitions

### Visualization Components
1. **Fleet CO2 Trajectory**: Line chart tracking total emissions over 10 years
2. **EV Adoption Curve**: Progressive line chart showing BEV/PHEV market penetration
3. **Market Share Analysis**: Conic gradient pie chart with 5 vehicle categories
4. **Policy Impact Bars**: Comparative visualization of vehicle price vs fuel cost components
5. **Cost Effectiveness Metric**: Real-time €/tCO2 calculation
6. **Agent Bubble Visualization**: Physics-based 2D representation of all 100 agents with color-coded types

## Recent Updates

### Latest Improvements
- **Enhanced Control Bar**: Updated policy labels to "Purchase tax" and "Fuel tax" for clarity
- **Bubble Visualization Fixes**: Improved animation smoothness and physics interactions
- **Security Update**: Upgraded to Next.js 15.5.7 to address CVE-2025-66478
- **Network Visualization**: Added force-directed graph capabilities for exploring policy connections
- **Comprehensive Metrics**: Added detailed monthly tracking for emissions, cost effectiveness, and market shares
- **PDF Documentation**: Integrated full technical report accessible from the dashboard

### Performance Optimizations

This project implements several performance enhancements:
- Dynamic imports for heavy components
- Memoization of expensive calculations
- RequestAnimationFrame-based animation loop (400ms per month)
- Debounced input handlers
- Optimized re-renders with React.memo
- Progressive data loading for charts

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

### Other Platforms

Build the production bundle:

```bash
npm run build
npm run start
```

Ensure your hosting platform supports:
- Node.js 18+
- Environment variables
- Static file serving

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Charts powered by [D3.js](https://d3js.org/) and [Recharts](https://recharts.org/)
- 3D visualizations with [Three.js](https://threejs.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)

## Contact

For questions, issues, or feedback:
- Open an issue on [GitHub](https://github.com/Echochohoo1010/Aftershock/issues)
- Visit the project repository: [https://github.com/Echochohoo1010/Aftershock](https://github.com/Echochohoo1010/Aftershock)

---

**Turn complexity into clarity** with Aftershock.
