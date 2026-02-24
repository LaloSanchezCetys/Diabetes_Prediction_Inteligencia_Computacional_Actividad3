import * as ort from 'onnxruntime-web';

let session: ort.InferenceSession | null = null;

export async function initializeModel() {
  if (session) return; // Already loaded

  try {
    const modelPath = '/Diabetes_Prediction_Inteligencia_Computacional_Actividad3/diabetes_svm_model.onnx';
    
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
    });
    
    console.log('ONNX model loaded successfully');
  } catch (error) {
    console.error('Failed to load ONNX model:', error);
    throw new Error('Failed to load the ML model. Make sure the model file is in the public folder.');
  }
}

export async function makePrediction(
  pregnancies: number,
  glucose: number,
  bloodPressure: number,
  skinThickness: number,
  insulin: number,
  bmi: number,
  diabetesPedigreeFunction: number,
  age: number
): Promise<0 | 1> {
  if (!session) {
    await initializeModel();
  }

  // Log input data
  const inputData = {
    pregnancies,
    glucose,
    bloodPressure,
    skinThickness,
    insulin,
    bmi,
    diabetesPedigreeFunction,
    age
  };
  console.log('Model Input Data:', inputData);

  try {
    // Create input tensors - each input should be [1, 1] for a single sample
    const inputs: Record<string, ort.Tensor> = {
      'Pregnancies': new ort.Tensor('float32', new Float32Array([pregnancies]), [1, 1]),
      'Glucose': new ort.Tensor('float32', new Float32Array([glucose]), [1, 1]),
      'BloodPressure': new ort.Tensor('float32', new Float32Array([bloodPressure]), [1, 1]),
      'SkinThickness': new ort.Tensor('float32', new Float32Array([skinThickness]), [1, 1]),
      'Insulin': new ort.Tensor('float32', new Float32Array([insulin]), [1, 1]),
      'BMI': new ort.Tensor('float32', new Float32Array([bmi]), [1, 1]),
      'DiabetesPedigreeFunction': new ort.Tensor('float32', new Float32Array([diabetesPedigreeFunction]), [1, 1]),
      'Age': new ort.Tensor('float32', new Float32Array([age]), [1, 1]),
    };

    const results = await session!.run(inputs);
    
    // Get the output - the model outputs the class directly (0 or 1)
    const outputKey = Object.keys(results)[0];
    const output = results[outputKey];
    const outputData = output.data as Float32Array | number[];
    
    // Extract the raw prediction (0 or 1) from the model output
    const rawPrediction = Number(outputData[0]);
    
    // Ensure it's exactly 0 or 1
    if (rawPrediction !== 0 && rawPrediction !== 1) {
      console.warn(`Unexpected model output: ${rawPrediction}, rounding to nearest class`);
    }
    
    const prediction = (Math.round(rawPrediction) as 0 | 1);
    
    // Log prediction result
    const predictionLabel = prediction === 1 ? 'Diabetes (1)' : 'No Diabetes (0)';
    console.log('Model Prediction:', prediction, `(${predictionLabel})`);
    
    return prediction;
  } catch (error) {
    console.error('Prediction error:', error);
    throw new Error('Failed to make prediction with the model.');
  }
}

export function isModelLoaded(): boolean {
  return session !== null;
}
