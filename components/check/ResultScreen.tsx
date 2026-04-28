import { Mic } from 'lucide-react'
import RiskResultComponent from './RiskResult'
import HospitalList from './HospitalList'
import Button from '@/components/ui/Button'
import { CheckResult } from '@/app/check/actions'

interface ResultScreenProps {
  riskResult: CheckResult | null
  user: any
  onBackToHome: () => void
  onCallCHW: () => void
  onCallEmergency: () => void
}

export default function ResultScreen({ 
  riskResult, 
  user, 
  onBackToHome, 
  onCallCHW, 
  onCallEmergency 
}: ResultScreenProps) {
  return (
    <div className="space-y-6">
      {riskResult && (
        <>
          <RiskResultComponent result={{
            riskLevel: riskResult.riskLevel as 'low' | 'medium' | 'high',
            conditionChecked: 'Maternal health symptoms',
            symptomsDetected: riskResult.riskFactors
          }} />

          {/* High Risk: Hospital List */}
          {riskResult.riskLevel === 'high' && (
            <>
              <HospitalList />
              
              <div>
                <h3 className="text-xs uppercase text-text-secondary font-medium mb-3">
                  Call your care team
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={onCallCHW}
                    className="flex items-center justify-center gap-2"
                  >
                    <Mic size={16} />
                    Call CHW
                  </Button>
                  <Button
                    onClick={onCallEmergency}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    style={{
                      color: 'var(--color-danger)',
                      borderColor: 'var(--color-danger)'
                    }}
                  >
                    <Mic size={16} />
                    Emergency: 999
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Back to Home Button */}
      <Button
        onClick={onBackToHome}
        variant="outline"
        fullWidth
      >
        Back to home
      </Button>
    </div>
  )
}
