// components/MapErrorBoundary.jsx
'use client'
import { Component } from 'react'

export default class MapErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Map Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-96 bg-red-50 text-red-500 p-4 flex items-center justify-center">
          O mapa não pôde ser carregado
        </div>
      )
    }
    return this.props.children
  }
}