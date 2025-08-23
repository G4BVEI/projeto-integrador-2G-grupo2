"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Tooltip,
  Legend,
} from "recharts"
import { Thermometer, Droplets, Sprout, TrendingUp, MapPin, Calendar } from "lucide-react"

// Sample data for different agricultural plots
const temperatureData = [
  { time: "00:00", plotA: 18, plotB: 16, plotC: 20, plotD: 17 },
  { time: "04:00", plotA: 15, plotB: 14, plotC: 17, plotD: 15 },
  { time: "08:00", plotA: 22, plotB: 20, plotC: 24, plotD: 21 },
  { time: "12:00", plotA: 28, plotB: 26, plotC: 30, plotD: 27 },
  { time: "16:00", plotA: 32, plotB: 30, plotC: 34, plotD: 31 },
  { time: "20:00", plotA: 26, plotB: 24, plotC: 28, plotD: 25 },
]

const moistureData = [
  { time: "00:00", plotA: 65, plotB: 70, plotC: 60, plotD: 68 },
  { time: "04:00", plotA: 68, plotB: 72, plotC: 63, plotD: 70 },
  { time: "08:00", plotA: 62, plotB: 68, plotC: 58, plotD: 65 },
  { time: "12:00", plotA: 55, plotB: 60, plotC: 50, plotD: 58 },
  { time: "16:00", plotA: 48, plotB: 55, plotC: 45, plotD: 52 },
  { time: "20:00", plotA: 58, plotB: 63, plotC: 55, plotD: 60 },
]

const growthData = [
  { week: "Week 1", plotA: 2.1, plotB: 1.8, plotC: 2.3, plotD: 2.0 },
  { week: "Week 2", plotA: 4.5, plotB: 4.2, plotC: 4.8, plotD: 4.3 },
  { week: "Week 3", plotA: 7.2, plotB: 6.8, plotC: 7.6, plotD: 7.0 },
  { week: "Week 4", plotA: 10.1, plotB: 9.5, plotC: 10.8, plotD: 9.8 },
  { week: "Week 5", plotA: 13.2, plotB: 12.4, plotC: 14.1, plotD: 12.9 },
  { week: "Week 6", plotA: 16.8, plotB: 15.9, plotC: 17.5, plotD: 16.2 },
]

const soilData = [
  { metric: "pH Level", plotA: 6.8, plotB: 7.2, plotC: 6.5, plotD: 7.0 },
  { metric: "Nitrogen", plotA: 85, plotB: 78, plotC: 92, plotD: 80 },
  { metric: "Phosphorus", plotA: 45, plotB: 52, plotC: 38, plotD: 48 },
  { metric: "Potassium", plotA: 120, plotB: 115, plotC: 128, plotD: 118 },
]

const plotStats = [
  { name: "Plot A", area: "2.5 acres", status: "Optimal", lastWatered: "2 hours ago" },
  { name: "Plot B", area: "3.1 acres", status: "Good", lastWatered: "4 hours ago" },
  { name: "Plot C", area: "1.8 acres", status: "Needs Attention", lastWatered: "6 hours ago" },
  { name: "Plot D", area: "2.9 acres", status: "Good", lastWatered: "3 hours ago" },
]

export default function DashboardGraphs() {
  const [selectedPlot, setSelectedPlot] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sprout className="h-8 w-8 text-green-500" />
                <h1 className="text-2xl font-bold text-gray-900">AgriMonitor</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select 
                  value={selectedPlot}
                  onChange={(e) => setSelectedPlot(e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Plots</option>
                  <option value="plotA">Plot A</option>
                  <option value="plotB">Plot B</option>
                  <option value="plotC">Plot C</option>
                  <option value="plotD">Plot D</option>
                </select>
              </div>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500">
                <Calendar className="h-4 w-4 mr-2" />
                Last 24h
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Plot Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {plotStats.map((plot) => (
            <div key={plot.name} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{plot.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plot.status === "Optimal" 
                      ? "bg-green-100 text-green-800" 
                      : plot.status === "Good" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {plot.status}
                  </span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {plot.area}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Droplets className="h-4 w-4 mr-1" />
                    {plot.lastWatered}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <Thermometer className="h-5 w-5 mr-2 text-green-500" />
                Temperature Over Time
              </h3>
              <p className="mt-1 text-sm text-gray-500">Temperature readings (°C) across all plots in the last 24 hours</p>
            </div>
            <div className="px-4 py-5">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="plotA" stroke="#22c55e" strokeWidth={2} name="Plot A" />
                    <Line type="monotone" dataKey="plotB" stroke="#3b82f6" strokeWidth={2} name="Plot B" />
                    <Line type="monotone" dataKey="plotC" stroke="#8b5cf6" strokeWidth={2} name="Plot C" />
                    <Line type="monotone" dataKey="plotD" stroke="#ef4444" strokeWidth={2} name="Plot D" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Moisture Chart */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <Droplets className="h-5 w-5 mr-2 text-green-500" />
                Soil Moisture Levels
              </h3>
              <p className="mt-1 text-sm text-gray-500">Moisture percentage across all plots in the last 24 hours</p>
            </div>
            <div className="px-4 py-5">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moistureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="plotA"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                      name="Plot A"
                    />
                    <Area
                      type="monotone"
                      dataKey="plotB"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Plot B"
                    />
                    <Area
                      type="monotone"
                      dataKey="plotC"
                      stackId="3"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                      name="Plot C"
                    />
                    <Area
                      type="monotone"
                      dataKey="plotD"
                      stackId="4"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                      name="Plot D"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Plant Growth Progress
              </h3>
              <p className="mt-1 text-sm text-gray-500">Average plant height (cm) over the past 6 weeks</p>
            </div>
            <div className="px-4 py-5">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="plotA" stroke="#22c55e" strokeWidth={3} name="Plot A" />
                    <Line type="monotone" dataKey="plotB" stroke="#3b82f6" strokeWidth={3} name="Plot B" />
                    <Line type="monotone" dataKey="plotC" stroke="#8b5cf6" strokeWidth={3} name="Plot C" />
                    <Line type="monotone" dataKey="plotD" stroke="#ef4444" strokeWidth={3} name="Plot D" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Soil Conditions Chart */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <Sprout className="h-5 w-5 mr-2 text-green-500" />
                Soil Conditions Comparison
              </h3>
              <p className="mt-1 text-sm text-gray-500">Current soil metrics across all plots</p>
            </div>
            <div className="px-4 py-5">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={soilData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="plotA" fill="#22c55e" name="Plot A" />
                    <Bar dataKey="plotB" fill="#3b82f6" name="Plot B" />
                    <Bar dataKey="plotC" fill="#8b5cf6" name="Plot C" />
                    <Bar dataKey="plotD" fill="#ef4444" name="Plot D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}