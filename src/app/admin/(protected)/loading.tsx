import { BikeWheelSpinner } from '@/components/ui/BikeWheelSpinner'

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <BikeWheelSpinner size={64} className="text-gold/60" />
    </div>
  )
}
