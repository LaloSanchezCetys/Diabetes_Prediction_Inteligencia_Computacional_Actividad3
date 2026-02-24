'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, CheckCircle2, AlertTriangle, Plus, Minus } from 'lucide-react'
import { initializeModel, makePrediction } from '@/lib/onnxService'

interface PredictionResult {
  prediction: 0 | 1
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
    const initModel = async () => {
      try {
        await initializeModel()
        setModelLoaded(true)
      } catch (error) {
        console.error('Failed to initialize model:', error)
        setResult({
          prediction: 0,
          status: 'error',
          message: 'Failed to load the ML model. Please refresh the page.'
        })
      }
    }

    initModel()
  }, [])

  const validateInput = (field: keyof typeof FIELD_RANGES, value: string): string | null => {
    const range = FIELD_RANGES[field]
    if (!value) return `${range.label} is required`

    const numValue = parseFloat(value)
    if (isNaN(numValue)) return `${range.label} must be a valid number`

    // Pregnancies must be an integer
    if (field === 'pregnancies' && !Number.isInteger(numValue)) {
      return `${range.label} must be a whole number`
    }

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
      // Use real ONNX model for prediction
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

      const prediction = await makePrediction(
        inputData[0],
        inputData[1],
        inputData[2],
        inputData[3],
        inputData[4],
        inputData[5],
        inputData[6],
        inputData[7]
      )

      setResult({
        prediction,
        status: 'success',
        message: prediction === 1 
          ? 'Based on the provided health metrics, the model predicts that diabetes is present.'
          : 'Based on the provided health metrics, the model predicts that diabetes is not present.'
      })
    } catch (error) {
      console.error('Prediction error:', error)
      setResult({
        prediction: 0,
        status: 'error',
        message: 'An error occurred during prediction. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      pregnancies: '',
      glucose: '',
      bloodPressure: '',
      skinThickness: '',
      insulin: '',
      bmi: '',
      diabetesPedigreeFunction: '',
      age: ''
    })
    setResult(null)
    setValidationErrors({})
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
          {/* Medical Disclaimer */}
          <Alert className="mb-6 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle className="ml-2">Medical Disclaimer</AlertTitle>
            <AlertDescription className="ml-2 mt-2 text-sm">
              This prediction tool is for <strong>educational purposes only</strong> and should not be used as a substitute for professional medical advice. Always consult with a healthcare professional for proper diagnosis and treatment.
            </AlertDescription>
          </Alert>

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
              {/* Pregnancies Stepper */}
              <div className="space-y-2">
                <Label htmlFor="pregnancies" className="font-semibold">
                  {FIELD_RANGES.pregnancies.label}
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = parseInt(formData.pregnancies) || 0
                      const newValue = Math.max(0, current - 1)
                      setFormData(prev => ({ ...prev, pregnancies: newValue.toString() }))
                    }}
                    disabled={loading || !modelLoaded || (parseInt(formData.pregnancies) || 0) <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="pregnancies"
                    name="pregnancies"
                    type="number"
                    step="1"
                    placeholder="0"
                    value={formData.pregnancies}
                    onChange={handleInputChange}
                    className={`text-center ${validationErrors.pregnancies ? 'border-destructive' : ''}`}
                    disabled={loading || !modelLoaded}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = parseInt(formData.pregnancies) || 0
                      const newValue = Math.min(17, current + 1)
                      setFormData(prev => ({ ...prev, pregnancies: newValue.toString() }))
                    }}
                    disabled={loading || !modelLoaded || (parseInt(formData.pregnancies) || 0) >= 17}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{FIELD_RANGES.pregnancies.description}</p>
                {validationErrors.pregnancies && (
                  <p className="text-xs text-destructive">{validationErrors.pregnancies}</p>
                )}
              </div>

              {/* Glucose */}
              <div className="space-y-2">
                <Label htmlFor="glucose" className="font-semibold">
                  {FIELD_RANGES.glucose.label}
                </Label>
                <Input
                  id="glucose"
                  name="glucose"
                  type="number"
                  step="any"
                  placeholder={`${FIELD_RANGES.glucose.min} - ${FIELD_RANGES.glucose.max}`}
                  value={formData.glucose}
                  onChange={handleInputChange}
                  className={validationErrors.glucose ? 'border-destructive' : ''}
                  disabled={loading || !modelLoaded}
                />
                <p className="text-xs text-muted-foreground">{FIELD_RANGES.glucose.description}</p>
                {validationErrors.glucose && (
                  <p className="text-xs text-destructive">{validationErrors.glucose}</p>
                )}
              </div>
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
                    step="any"
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
                    step="any"
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
                    step="any"
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

            {/* Submit and Reset Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-auto text-base"
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
              <Button
                type="button"
                variant="outline"
                className="flex-1 font-semibold py-2 h-auto text-base"
                onClick={handleReset}
                disabled={loading || !modelLoaded}
              >
                Reset Form
              </Button>
            </div>
          </form>

          {/* Result Display */}
          {result && (
            <div className="mt-8 space-y-4">
              {result.status === 'success' ? (
                <Alert className={`border-2 ${result.prediction === 1 ? 'border-destructive/50 bg-destructive/5' : 'border-emerald-500/50 bg-emerald-500/5'}`}>
                  {result.prediction === 1 ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  )}
                  <AlertTitle className="ml-2">
                    {result.prediction === 1 ? 'Diabetes Predicted' : 'No Diabetes Predicted'}
                  </AlertTitle>
                  <AlertDescription className="ml-2 mt-2">
                    {result.message}
                  </AlertDescription>
                </Alert>
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
