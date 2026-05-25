import axios from 'axios'

export const generateImage = async ({ prompt, width, height, steps, guidance }) => {
  const response = await axios.post('http://localhost:8000/generate', {
    prompt,
    width,
    height,
    num_inference_steps: steps,
    guidance_scale: guidance,
  })
  return response.data // { filename, status, prompt }
}

export const getDownloadUrl = (filename) => {
  return `http://localhost:8000/download/${filename}`
}