import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', sans-serif"
        }}>
          <div style={{ textAlign: 'center', color: '#6B1F2A' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Something went wrong.</div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Please refresh the page.</div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
