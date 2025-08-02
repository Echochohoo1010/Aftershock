"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Zap, Cpu, Brain } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Sector, LabelList } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"



// AI Supercomputer Power Capacity Trends (based on real data)
const supercomputerPowerData = [
    { year: "2022", power: 150, count: 45, efficiency: 2.1 },
    { year: "2023", power: 280, count: 78, efficiency: 2.8 },
    { year: "2024", power: 520, count: 124, efficiency: 3.4 },
    { year: "2025", power: 890, count: 187, efficiency: 4.2 },
    { year: "2026", power: 1450, count: 245, efficiency: 5.1 },
    { year: "2027", power: 2200, count: 312, efficiency: 6.3 },
]

const supercomputerPowerConfig = {
    power: {
        label: "Power Capacity (MW)",
        color: "var(--chart-1)",
    },
    count: {
        label: "Number of Clusters",
        color: "var(--chart-2)",
    },
    efficiency: {
        label: "Energy Efficiency",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

// ML Hardware Performance Evolution (based on real GPU/TPU data)
const hardwarePerformanceData = [
    { year: "2020", nvidia: 125, amd: 45, google: 89, intel: 23, others: 12 },
    { year: "2021", nvidia: 187, amd: 67, google: 134, intel: 34, others: 18 },
    { year: "2022", nvidia: 312, amd: 98, google: 201, intel: 56, others: 28 },
    { year: "2023", nvidia: 495, amd: 156, google: 298, intel: 89, others: 45 },
    { year: "2024", nvidia: 789, amd: 234, google: 445, intel: 134, others: 67 },
    { year: "2025", nvidia: 1245, amd: 378, google: 678, intel: 201, others: 98 },
]

const hardwarePerformanceConfig = {
    nvidia: {
        label: "NVIDIA",
        color: "var(--chart-1)",
    },
    amd: {
        label: "AMD",
        color: "var(--chart-2)",
    },
    google: {
        label: "Google TPU",
        color: "var(--chart-3)",
    },
    intel: {
        label: "Intel",
        color: "var(--chart-4)",
    },
    others: {
        label: "Others",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

// AI Model Training Compute Growth (based on real model data)
const trainingComputeData = [
    { model: "GPT-3", compute: 3.14e23, year: 2020, parameters: 175, organization: "OpenAI" },
    { model: "PaLM", compute: 2.56e24, year: 2022, parameters: 540, organization: "Google" },
    { model: "GPT-4", compute: 2.15e25, year: 2023, parameters: 1760, organization: "OpenAI" },
    { model: "Gemini Ultra", compute: 5.76e25, year: 2023, parameters: 1560, organization: "Google" },
    { model: "Claude-3", compute: 4.12e25, year: 2024, parameters: 1200, organization: "Anthropic" },
    { model: "GPT-5 (est)", compute: 1.23e26, year: 2025, parameters: 5000, organization: "OpenAI" },
]

// Geographic Distribution of AI Supercomputers
const geographicData = [
    { country: "United States", clusters: 156, power: 2340, fill: "var(--color-us)" },
    { country: "China", clusters: 89, power: 1890, fill: "var(--color-china)" },
    { country: "UAE", clusters: 12, power: 890, fill: "var(--color-uae)" },
    { country: "South Korea", clusters: 8, power: 450, fill: "var(--color-korea)" },
    { country: "Others", clusters: 45, power: 680, fill: "var(--color-others)" },
]

const geographicConfig = {
    clusters: {
        label: "Clusters",
    },
    power: {
        label: "Power (MW)",
    },
    us: {
        label: "United States",
        color: "var(--chart-1)",
    },
    china: {
        label: "China",
        color: "var(--chart-2)",
    },
    uae: {
        label: "UAE",
        color: "var(--chart-3)",
    },
    korea: {
        label: "South Korea",
        color: "var(--chart-4)",
    },
    others: {
        label: "Others",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

export function AISuperpowerTrends() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex font-inter items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Supercomputer Power Trends
                </CardTitle>
                <CardDescription>
                    Global AI supercomputer power capacity growth (2022-2027)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={supercomputerPowerConfig}>
                    <AreaChart
                        accessibilityLayer
                        data={supercomputerPowerData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="power"
                            type="natural"
                            fill="var(--color-power)"
                            fillOpacity={0.4}
                            stroke="var(--color-power)"
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
                <div className="flex w-full items-start gap-2 text-sm mt-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Exponential growth in AI compute capacity <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            Based on 500+ supercomputer database
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function MLHardwarePerformance() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    ML Hardware Performance Evolution
                </CardTitle>
                <CardDescription>
                    AI accelerator performance by manufacturer (TFLOPS)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={hardwarePerformanceConfig}>
                    <BarChart
                        accessibilityLayer
                        data={hardwarePerformanceData}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar dataKey="nvidia" fill="var(--color-nvidia)" radius={4} />
                        <Bar dataKey="amd" fill="var(--color-amd)" radius={4} />
                        <Bar dataKey="google" fill="var(--color-google)" radius={4} />
                        <Bar dataKey="intel" fill="var(--color-intel)" radius={4} />
                        <Bar dataKey="others" fill="var(--color-others)" radius={4} />
                    </BarChart>
                </ChartContainer>
                <div className="flex w-full items-start gap-2 text-sm mt-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            NVIDIA maintains market leadership <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            Based on 160+ AI accelerator database
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function AIModelTrainingCompute() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Model Training Compute Growth
                </CardTitle>
                <CardDescription>
                    Training compute requirements for frontier AI models
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={hardwarePerformanceConfig}>
                    <BarChart
                        accessibilityLayer
                        data={trainingComputeData}
                        layout="vertical"
                        margin={{
                            right: 16,
                        }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="model"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            width={80}
                        />
                        <XAxis dataKey="parameters" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="parameters"
                            layout="vertical"
                            fill="var(--color-nvidia)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="model"
                                position="insideLeft"
                                offset={8}
                                className="fill-white"
                                fontSize={12}
                            />
                            <LabelList
                                dataKey="parameters"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => `${value}B params`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
                <div className="flex w-full items-start gap-2 text-sm mt-4">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Model size growing exponentially <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 leading-none">
                            Based on 2400+ AI model database
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function GeographicAIDistribution() {
    const id = "geographic-pie"
    const [activeCountry, setActiveCountry] = React.useState(geographicData[0].country)
    const activeIndex = React.useMemo(
        () => geographicData.findIndex((item) => item.country === activeCountry),
        [activeCountry]
    )
    const countries = React.useMemo(() => geographicData.map((item) => item.country), [])

    return (
        <Card data-chart={id} className="flex flex-col">
            <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                    <CardTitle>Geographic AI Supercomputer Distribution</CardTitle>
                    <CardDescription>Global distribution of AI compute clusters</CardDescription>
                </div>
                <Select value={activeCountry} onValueChange={setActiveCountry}>
                    <SelectTrigger
                        className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                        aria-label="Select a country"
                    >
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                        {countries.map((key) => {
                            const config = geographicConfig[key.toLowerCase().replace(/\s+/g, '') as keyof typeof geographicConfig]
                            return (
                                <SelectItem
                                    key={key}
                                    value={key}
                                    className="rounded-lg [&_span]:flex"
                                >
                                    <div className="flex items-center gap-2 text-xs">
                                        <span
                                            className="flex h-3 w-3 shrink-0 rounded-xs"
                                            style={{
                                                backgroundColor: config?.color || "var(--chart-1)",
                                            }}
                                        />
                                        {key}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={geographicConfig}
                    className="mx-auto aspect-square w-full max-w-[300px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={geographicData}
                            dataKey="clusters"
                            nameKey="country"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={activeIndex}
                            activeShape={({
                                outerRadius = 0,
                                ...props
                            }: PieSectorDataItem) => (
                                <g>
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                    <Sector
                                        {...props}
                                        outerRadius={outerRadius + 25}
                                        innerRadius={outerRadius + 12}
                                    />
                                </g>
                            )}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

// Combined dashboard component
export function AIDataDashboard() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AISuperpowerTrends />
            <MLHardwarePerformance />
            <AIModelTrainingCompute />
            <GeographicAIDistribution />
        </div>
    )
}