import React, { useState, Component } from 'react'

class ErrorBoundary extends Component<{children: React.ReactNode}, {error: string | null}> {
  constructor(props: any) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e: Error) { return { error: e.message + '\n' + e.stack } }
  render() {
    if (this.state.error) return <pre style={{padding:16,color:'red',fontSize:12,whiteSpace:'pre-wrap'}}>{this.state.error}</pre>
    return this.props.children
  }
}
import { Calculator, FileText, TrendingUp, RotateCcw } from 'lucide-react'
import { SalaryCalculator } from './components/tabs/SalaryCalculator'
import { TaxDeductions } from './components/tabs/TaxDeductions'
import { HikeCompare } from './components/tabs/HikeCompare'
import { ReverseCalculator } from './components/tabs/ReverseCalculator'

type Tab = 'salary' | 'tax' | 'hike' | 'reverse'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('salary')

  const renderContent = () => {
    switch (activeTab) {
      case 'salary': return <SalaryCalculator />
      case 'tax': return <TaxDeductions />
      case 'hike': return <HikeCompare />
      case 'reverse': return <ReverseCalculator />
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-primary font-sans selection:bg-accent-green selection:text-black">
      <main className="max-w-md mx-auto min-h-screen bg-bg-primary relative shadow-2xl overflow-hidden">
        {/* Scrollable Content */}
        <div className="px-6 py-4 pb-28">
          {renderContent()}
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-black text-white pt-2 px-6 max-w-md mx-auto rounded-t-3xl shadow-nav"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
          <div className="flex justify-between items-center h-16">
            <NavButton active={activeTab === 'salary'} onClick={() => setActiveTab('salary')} icon={<Calculator className="w-6 h-6" />} label="Salary" />
            <NavButton active={activeTab === 'tax'} onClick={() => setActiveTab('tax')} icon={<FileText className="w-6 h-6" />} label="Tax" />
            <NavButton active={activeTab === 'hike'} onClick={() => setActiveTab('hike')} icon={<TrendingUp className="w-6 h-6" />} label="Hike" />
            <NavButton active={activeTab === 'reverse'} onClick={() => setActiveTab('reverse')} icon={<RotateCcw className="w-6 h-6" />} label="CTC Needed" />
          </div>
        </nav>
      </main>
    </div>
  )
}

function NavButton({ active, onClick, icon, label }: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 transition-all duration-200 ${
        active ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`mb-1 ${active ? 'text-accent-green' : ''}`}>{icon}</div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
      {active && <div className="w-1 h-1 bg-accent-green rounded-full mt-1" />}
    </button>
  )
}

export { App, ErrorBoundary }
