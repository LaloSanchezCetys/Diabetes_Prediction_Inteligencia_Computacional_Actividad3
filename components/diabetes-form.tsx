'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

interface PredictionResult {
  prediction: number
  probability: number
  status: 'success' | 'error'
  message: string
}

const FIELD_RANGES = {
  pregnancies: { min: 0, max: 17, label: 'Pregnancies', description: 'Number of pregnancies (0-17)' },
  glucose: { min: 0, max: 199, label: 'Glucose', description: 'Glucose level in blood (0-199 mg/dL)' },
  bloodPressure: { min: 0, max: 122, label: 'Blood Pressure', description: 'Blood pressure measurement (0-122 mmHg)' },
  skinThickness: { min: 0, max: 99, label: 'Skin Thickness', description: 'Thickness of skin (0-99 mm)' },
  insulin: { min: 0, max: 846, label: 'Insulin', description: 'Insulin level in blood (0-846 mIU/L)' },
  bmi: { min: 0, max: 67.1, label: 'BMI', description: 'Body mass index (0-67.1)' },
  diabetesPedigreeFunction: { min: 0.08, max: 2.42, label: 'Diabetes Pedigree Function', description: 'Diabetes percentage (0.08-2.42)' },
  age: { min: 21, max: 81, label: 'Age', description: 'Age in years (21-81)' }
}

export function DiabetesForm() {
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    skinThickness: '',
    insulin: '',
    bmi: '',
    diabetesPedigreeFunction: '',
    age: ''
  })

  const [result, setResult] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Initialize ONNX Runtime
    const initializeModel = async () => {
      try {
        // The model will be loaded on first prediction
        setModelLoaded(true)
      } catch (error) {
        console.error('Failed to initialize model:', error)
        setResult({
          prediction: 0,
          probability: 0,
          status: 'error',
          message: 'Failed to load the ML model'
        })
      }
    }

    initializeModel()
  }, [])

  const validateInput = (field: keyof typeof FIELD_RANGES, value: string): string | null => {
    const range = FIELD_RANGES[field]
    if (!value) return `${range.label} is required`

    const numValue = parseFloat(value)
    if (isNaN(numValue)) return `${range.label} must be a valid number`

    if (numValue < range.min || numValue > range.max) {
      return `${range.label} must be between ${range.min} and ${range.max}`
    }

    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const { [name]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all inputs
    const errors: Record<string, string> = {}
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateInput(key as keyof typeof FIELD_RANGES, value)
      if (error) errors[key] = error
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setLoading(true)
    setResult(null)

    try {
      // Simulate model prediction with ONNX
      // In a real scenario, you would load the actual ONNX model here
      const inputData = [
        parseFloat(formData.pregnancies),
        parseFloat(formData.glucose),
        parseFloat(formData.bloodPressure),
        parseFloat(formData.skinThickness),
        parseFloat(formData.insulin),
        parseFloat(formData.bmi),
        parseFloat(formData.diabetesPedigreeFunction),
        parseFloat(formData.age)
      ]

      // Simulate a prediction (replace with actual ONNX inference)
      // For now, we'll use a simple mock prediction
      const mockPrediction = await simulatePrediction(inputData)

      setResult({
        prediction: mockPrediction.prediction,
        probability: mockPrediction.probability,
        status: 'success',
        message: mockPrediction.prediction === 1 
          ? `Based on the provided health metrics, the model predicts a ${(mockPrediction.probability * 100).toFixed(1)}% probability of diabetes.`
          : `Based on the provided health metrics, the model predicts a ${((1 - mockPrediction.probability) * 100).toFixed(1)}% probability of no diabetes.`
      })
    } catch (error) {
      console.error('Prediction error:', error)
      setResult({
        prediction: 0,
        probability: 0,
        status: 'error',
        message: 'An error occurred during prediction. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const simulatePrediction = async (inputData: number[]): Promise<{ prediction: number; probability: number }> => {
    // This is a placeholder for actual ONNX model inference
    // In production, you would use onnxruntime-web to load and run the actual model
    
    // Simple mock prediction based on glucose and BMI
    const glucose = inputData[1]
    const bmi = inputData[5]
    
    // Mock logic: if glucose > 125 or BMI > 30, higher diabetes risk
    let probability = 0.3
    if (glucose > 125) probability += 0.2
    if (bmi > 30) probability += 0.2
    if (inputData[0] > 5) probability += 0.1 // pregnancies
    
    probability = Math.min(0.95, probability)
    const prediction = probability > 0.5 ? 1 : 0
    
    return { prediction, probability }
  }

  return (
    <div className="w-full">
      <Card className="border-2 border-primary">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardTitle className="text-2xl">Diabetes Risk Prediction</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Powered by Pima Indians Diabetes Dataset Analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {/* Dataset Information */}
          <Alert className="mb-6 border-accent/50 bg-accent/5">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertTitle className="ml-2">About This Model</AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-sm">
              <p className="mb-3">
                This dataset is originally from the National Institute of Diabetes and Digestive and Kidney Diseases. The objective is to diagnostically predict whether a patient has diabetes based on certain diagnostic measurements.
              </p>
              <p className="mb-2 font-semibold">Dataset Constraints:</p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>All patients are females</li>
                <li>Minimum age: 21 years old</li>
                <li>All patients are of Pima Indian heritage</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Input Range Notice */}
          <Alert className="mb-6 border-accent/50 bg-secondary/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="ml-2">Input Ranges</AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-sm">
              Input fields are restricted to specific ranges based on the dataset&apos;s characteristics. Please ensure all values are within the acceptable ranges shown below.
            </AlertDescription>
          </Alert>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {(['pregnancies', 'glucose'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="font-semibold">
                    {FIELD_RANGES[field].label}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type="number"
                    step={field === 'bmi' || field === 'diabetesPedigreeFunction' ? '0.01' : '1'}
                    placeholder={`${FIELD_RANGES[field].min} - ${FIELD_RANGES[field].max}`}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={validationErrors[field] ? 'border-destructive' : ''}
                    disabled={loading || !modelLoaded}
                  />
                  <p className="text-xs text-muted-foreground">{FIELD_RANGES[field].description}</p>
                  {validationErrors[field] && (
                    <p className="text-xs text-destructive">{validationErrors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Second Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {(['bloodPressure', 'skinThickness'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="font-semibold">
                    {FIELD_RANGES[field].label}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type="number"
                    step="1"
                    placeholder={`${FIELD_RANGES[field].min} - ${FIELD_RANGES[field].max}`}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={validationErrors[field] ? 'border-destructive' : ''}
                    disabled={loading || !modelLoaded}
                  />
                  <p className="text-xs text-muted-foreground">{FIELD_RANGES[field].description}</p>
                  {validationErrors[field] && (
                    <p className="text-xs text-destructive">{validationErrors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Third Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {(['insulin', 'bmi'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="font-semibold">
                    {FIELD_RANGES[field].label}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type="number"
                    step={field === 'bmi' ? '0.1' : '1'}
                    placeholder={`${FIELD_RANGES[field].min} - ${FIELD_RANGES[field].max}`}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={validationErrors[field] ? 'border-destructive' : ''}
                    disabled={loading || !modelLoaded}
                  />
                  <p className="text-xs text-muted-foreground">{FIELD_RANGES[field].description}</p>
                  {validationErrors[field] && (
                    <p className="text-xs text-destructive">{validationErrors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Fourth Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {(['diabetesPedigreeFunction', 'age'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field} className="font-semibold">
                    {FIELD_RANGES[field].label}
                  </Label>
                  <Input
                    id={field}
                    name={field}
                    type="number"
                    step={field === 'diabetesPedigreeFunction' ? '0.01' : '1'}
                    placeholder={`${FIELD_RANGES[field].min} - ${FIELD_RANGES[field].max}`}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={validationErrors[field] ? 'border-destructive' : ''}
                    disabled={loading || !modelLoaded}
                  />
                  <p className="text-xs text-muted-foreground">{FIELD_RANGES[field].description}</p>
                  {validationErrors[field] && (
                    <p className="text-xs text-destructive">{validationErrors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-auto text-base"
              disabled={loading || !modelLoaded}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Predicting...
                </div>
              ) : (
                'Get Prediction'
              )}
            </Button>
          </form>

          {/* Result Display */}
          {result && (
            <div className="mt-8 space-y-4">
              {result.status === 'success' ? (
                <>
                  <Alert className={`border-2 ${result.prediction === 1 ? 'border-destructive/50 bg-destructive/5' : 'border-emerald-500/50 bg-emerald-500/5'}`}>
                    {result.prediction === 1 ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                    <AlertTitle className="ml-2">
                      {result.prediction === 1 ? 'Higher Risk Detected' : 'Lower Risk Indicated'}
                    </AlertTitle>
                    <AlertDescription className="ml-2 mt-2">
                      {result.message}
                    </AlertDescription>
                  </Alert>
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="text-sm">Prediction Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">Diabetes Risk Probability:</span>
                        <span className="font-mono font-bold text-accent">
                          {(result.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${result.probability > 0.5 ? 'bg-destructive' : 'bg-emerald-600'}`}
                          style={{ width: `${result.probability * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Alert className="border-destructive/50 bg-destructive/5">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <AlertTitle className="ml-2">Prediction Error</AlertTitle>
                  <AlertDescription className="ml-2 mt-2">
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
