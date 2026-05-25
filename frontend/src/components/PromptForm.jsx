import React, { useState } from 'react'

export default function PromptForm({ onGenerate, loading }) {
  const [prompt, setPrompt] = useState('')

  return (
    <div className="prompt-wrapper">
      <textarea
        className="prompt-textarea"
        placeholder="Describe the image you want to generate..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={4}
      />
      <button
        className="generate-btn"
        onClick={() => onGenerate(prompt)}
        disabled={loading || !prompt.trim()}
      >
        {loading ? '⏳ Generating...' : '🎨 Generate Image'}
      </button>
    </div>
  )
}