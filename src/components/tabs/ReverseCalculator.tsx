import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { DisplayAmount } from '../ui/DisplayAmount'
import { formatIndianCurrency } from '../../utils/formatting'
import { calculateTax, calcPF } from '../../utils/taxLogic'

export function ReverseCalculator() {
  const [targetInHand, setTargetInHand] = useState<number>(100000)
  const [result, setResult] = useState<{ ctc: number; tax: number; pf: number } | null>(null)

  const calculateRequiredCTC = () => {
    const targetAnnualNet = targetInHand * 12
    // Upper bound: net is at most ~65% of CTC after tax+PF+PT, so CTC < net * 2.5 covers all cases
    let low = targetAnnualNet
    let high = targetAnnualNet * 2.5
    let ctc = (low + high) / 2

    const getNet = (c: number) => {
      const basic = c * 0.5
      const employerPF = calcPF(basic)
      const gratuity = basic * 0.0481
      const gross = c - employerPF - gratuity
      const employeePF = calcPF(basic)
      const pt = 2500
      const tax = calculateTax(gross, 'new').totalTax
      return gross - employeePF - pt - tax
    }

    for (let i = 0; i < 25; i++) {
      ctc = (low + high) / 2
      const net = getNet(ctc)
      if (Math.abs(net - targetAnnualNet) < 100) break
      if (net < targetAnnualNet) {
        low = ctc
      } else {
        high = ctc
      }
    }

    const basic = ctc * 0.5
    const employerPF = calcPF(basic)
    const gratuity = basic * 0.0481
    const gross = ctc - employerPF - gratuity

    setResult({
      ctc,
      tax: calculateTax(gross, 'new').totalTax,
      pf: calcPF(basic),
    })
  }

  return (
    <div className="space-y-6 pb-24 pt-4">
      <h2 className="text-2xl font-bold">Reverse Calculator</h2>
      <p className="text-secondary text-sm">
        Calculate required CTC for your desired monthly in-hand salary.
      </p>

      <Card>
        <div className="space-y-6">
          <Input
            label="Desired Monthly In-Hand"
            prefix="₹"
            type="number"
            value={targetInHand}
            onChange={(e) => setTargetInHand(Number(e.target.value))}
          />
          <Button fullWidth onClick={calculateRequiredCTC}>
            Calculate Required CTC
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center py-8">
            <p className="text-secondary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              You need a CTC of
            </p>
            <DisplayAmount amount={result.ctc} size="hero" suffix="/yr" />
          </div>

          <Card className="bg-bg-secondary border-transparent">
            <h3 className="font-bold mb-3 text-sm">Estimated Deductions (New Regime)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Income Tax</span>
                <span className="display-sm font-semibold">{formatIndianCurrency(result.tax)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary">Provident Fund (statutory cap)</span>
                <span className="display-sm font-semibold">{formatIndianCurrency(result.pf)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
