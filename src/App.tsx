import React, { useEffect, useRef, useState, Component } from 'react'

class ErrorBoundary extends Component<{children: React.ReactNode}, {error: string | null}> {
  constructor(props: {children: React.ReactNode}) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e: Error) { return { error: e.message + '\n' + e.stack } }
  render() {
    if (this.state.error) {
      if (import.meta.env.DEV) {
        return <pre style={{padding:16,color:'red',fontSize:12,whiteSpace:'pre-wrap'}}>{this.state.error}</pre>
      }
      return (
        <div style={{ padding: 16 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: '#666', fontSize: 14 }}>Please refresh the app and try again.</p>
        </div>
      )
    }
    return this.props.children
  }
}
import { Calculator, FileText, TrendingUp, RotateCcw } from 'lucide-react'
import { SalaryCalculator } from './components/tabs/SalaryCalculator'
import { TaxDeductions } from './components/tabs/TaxDeductions'
import { HikeCompare } from './components/tabs/HikeCompare'
import { ReverseCalculator } from './components/tabs/ReverseCalculator'
import { OnboardingModal } from './components/OnboardingModal'

type Tab = 'salary' | 'tax' | 'hike' | 'reverse'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('salary')
  const [navVisible, setNavVisible] = useState(true)
  const lastScrollY = useRef(0)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [savedCtc, setSavedCtc] = useState<number | null>(null)
  const [sharedCtc, setSharedCtc] = useState<number>(0)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    const storedCtc = localStorage.getItem('savedCtc')

    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    } else if (storedCtc) {
      const parsed = Number(storedCtc)
      setSavedCtc(parsed)
      setSharedCtc(parsed)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current + 10) {
        setNavVisible(false)
      } else if (currentScrollY < lastScrollY.current - 5) {
        setNavVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    setNavVisible(true)
    lastScrollY.current = 0
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const handleOnboardingComplete = (ctc: number | null) => {
    localStorage.setItem('hasSeenOnboarding', 'true')
    if (ctc) {
      localStorage.setItem('savedCtc', ctc.toString())
      setSavedCtc(ctc)
      setSharedCtc(ctc)
    }
    setShowOnboarding(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'salary': return <SalaryCalculator savedCtc={sharedCtc > 0 ? sharedCtc : savedCtc} onCtcChange={setSharedCtc} />
      case 'tax': return <TaxDeductions sharedCtc={sharedCtc} onCtcChange={setSharedCtc} />
      case 'hike': return <HikeCompare savedCtc={savedCtc} sharedCtc={sharedCtc} />
      case 'reverse': return <ReverseCalculator />
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-primary font-sans selection:bg-accent-green selection:text-black">
      <main className="max-w-md mx-auto min-h-screen bg-bg-primary relative shadow-2xl overflow-x-hidden">
        {/* Scrollable Content */}
        <div className="px-6 py-4 pb-28">
          {renderContent()}
        </div>

        {/* Bottom Navigation — hides on scroll down, shows on scroll up */}
        <nav
          className={`fixed bottom-0 left-0 right-0 bg-black text-white pt-2 px-6 max-w-md mx-auto rounded-t-3xl transition-transform duration-300 ease-in-out ${navVisible ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex justify-between items-center h-16">
            <NavButton active={activeTab === 'salary'} onClick={() => handleTabChange('salary')} icon={<Calculator className="w-6 h-6" />} label="Salary" />
            <NavButton active={activeTab === 'tax'} onClick={() => handleTabChange('tax')} icon={<FileText className="w-6 h-6" />} label="Tax" />
            <NavButton active={activeTab === 'hike'} onClick={() => handleTabChange('hike')} icon={<TrendingUp className="w-6 h-6" />} label="Hike" />
            <NavButton active={activeTab === 'reverse'} onClick={() => handleTabChange('reverse')} icon={<RotateCcw className="w-6 h-6" />} label="Reverse" />
          </div>
        </nav>

        {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
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
    </button>
  )
}

export { App, ErrorBoundary }
