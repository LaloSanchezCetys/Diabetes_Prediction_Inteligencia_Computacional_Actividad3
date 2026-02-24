import { DiabetesForm } from '@/components/diabetes-form'

export default function Home() {
  return (
    <main className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Diabetes Risk Assessment
          </h1>
          <p className="text-lg text-muted-foreground">
            Use this tool to get a personalized diabetes risk prediction
          </p>
        </div>
        
        <DiabetesForm />
      </div>
    </main>
  )
}
