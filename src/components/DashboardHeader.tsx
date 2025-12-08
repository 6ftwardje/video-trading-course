import IntroVideo from './IntroVideo'

type DashboardHeaderProps = {
  thumbnailUrl?: string
}

export default function DashboardHeader({ thumbnailUrl }: DashboardHeaderProps) {
  return (
    <div>
      <IntroVideo 
        className="rounded-xl overflow-hidden shadow-xl ring-1 ring-black/5" 
        thumbnailUrl={thumbnailUrl}
      />
    </div>
  )
}

