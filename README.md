# Aftershock

A sophisticated policy simulation and analysis platform that turns complex policy scenarios into interactive, data-driven insights. Designed for policymakers, researchers, and analysts to explore the ripple effects of policy decisions through agent-based modeling and dynamic visualizations.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-blue?style=flat-square&logo=python)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Overview

Aftershock provides an interactive canvas for exploring policy interventions through:
- **Agent-Based Simulations**: Model real-world scenarios with thousands of autonomous agents
- **Interactive Visualizations**: Dynamic charts, network graphs, and 3D visualizations
- **Real-Time Analysis**: Adjust parameters and see immediate policy impacts
- **Data-Driven Insights**: Export detailed reports and simulation data

## Features

### Policy Simulations
- **Carbon Pricing Models**: Analyze carbon tax implementations across different scenarios
  - Household income distribution analysis
  - Renewable energy investment impacts
  - Industrial output effects
  - Agent-based vehicle fleet modeling

### Visualization Suite
- **Interactive Charts**: Time-series analysis, distribution plots, and comparative metrics
- **Network Visualizations**: Force-directed graphs showing policy ripple effects
- **Bubble Visualizations**: Multi-dimensional data exploration with physics-based interactions
- **3D Globe**: Geographic policy impact visualization with interactive markers

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

### Environment Variables

Create a `.env.local` file in the root directory:
```env
# Add your API keys here if using AI features
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## Project Structure

```
Aftershock/
├── app/                          # Next.js app router pages
│   ├── api/                      # API routes
│   ├── canvas/                   # Simulation canvas page
│   ├── explore/                  # Case selection page
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── core/                     # Core UI components
│   ├── visualizations/           # Visualization components
│   │   ├── carbon-pricing/       # Carbon pricing specific viz
│   │   ├── charts/               # Chart components
│   │   └── shared/               # Shared viz utilities
│   └── CaseSelectionGallery.tsx  # Case selection UI
├── lib/                          # Utility libraries
├── public/                       # Static assets
│   ├── simulations/              # Python simulation scripts
│   └── sounds/                   # Audio assets
├── docs/                         # Documentation
└── package.json                  # Dependencies and scripts
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Running Simulations

Python simulations are located in `public/simulations/`:

```bash
cd public/simulations
python netherlands_carbon_pricing_simulation.py
```

Simulation outputs are automatically loaded by the frontend visualizations.

## Key Features in Detail

### Agent-Based Modeling
The carbon pricing simulation models thousands of household agents with:
- Income distribution (log-normal)
- Driving behavior patterns
- Vehicle ownership and preferences
- Policy awareness levels
- Urban/rural distinctions
- Company car considerations

### Interactive Canvas
The analysis canvas provides:
- Real-time parameter adjustment
- Multi-panel visualization layouts
- Synchronized data updates
- Export functionality
- Responsive design for all screen sizes

### Visualization Types
1. **Time Series**: Track policy impacts over time
2. **Distribution Charts**: Analyze household and income distributions
3. **Network Graphs**: Explore policy connections and dependencies
4. **Bubble Charts**: Multi-dimensional data exploration
5. **Geographic Maps**: 3D globe with policy markers

## Performance Optimizations

This project implements several performance enhancements:
- Dynamic imports for heavy components
- Memoization of expensive calculations
- Virtualized lists for large datasets
- Debounced input handlers
- Optimized re-renders with React.memo

See [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) for details.

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
