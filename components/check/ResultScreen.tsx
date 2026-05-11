import { Mic, CheckCircle2, AlertCircle } from 'lucide-react'
import RiskResultComponent from './RiskResult'
import HospitalList from './HospitalListDebug'
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

          {/* SMS Alert Status for High Risk */}
          {riskResult.riskLevel === 'high' && riskResult.smsAlertStatus && (
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: 'var(--color-blue-light)',
                border: '1px solid var(--color-blue-dark)'
              }}
            >
              <div className="flex items-start gap-3">
                <div style={{ color: 'var(--color-blue-dark)' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="flex-1">
                  <h4
                    className="font-semibold text-sm mb-2"
                    style={{ color: 'var(--color-blue-dark)' }}
                  >
                    Alerts sent to your care team
                  </h4>
                  <div className="space-y-1 text-xs" style={{ color: 'var(--color-blue-dark)', opacity: 0.8 }}>
                    <div className="flex items-center gap-2">
                      {riskResult.smsAlertStatus.chwSent ? (
                        <CheckCircle2 size={12} className="text-green-600" />
                      ) : (
                        <AlertCircle size={12} className="text-amber-600" />
                      )}
                      <span>Health Worker (CHW): {riskResult.smsAlertStatus.chwSent ? 'Sent' : 'Not sent'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {riskResult.smsAlertStatus.emergencySent ? (
                        <CheckCircle2 size={12} className="text-green-600" />
                      ) : (
                        <AlertCircle size={12} className="text-amber-600" />
                      )}
                      <span>Emergency Contact: {riskResult.smsAlertStatus.emergencySent ? 'Sent' : 'Not sent'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
