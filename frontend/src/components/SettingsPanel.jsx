import React from 'react'

export default function SettingsPanel({ settings, onChange }) {
  return (
    <div className="settings-panel">
      <h3>⚙️ Settings</h3>

      <label>Width</label>
      <select value={settings.width}
        onChange={e => onChange({ ...settings, width: Number(e.target.value) })}>
        <option value={512}>512px</option>
        <option value={768}>768px</option>
      </select>

      <label>Height</label>
      <select value={settings.height}
        onChange={e => onChange({ ...settings, height: Number(e.target.value) })}>
        <option value={512}>512px</option>
        <option value={768}>768px</option>
      </select>

      <label>Steps: {settings.steps}</label>
      <input type="range" min={10} max={50} value={settings.steps}
        onChange={e => onChange({ ...settings, steps: Number(e.target.value) })} />

      <label>Guidance Scale: {settings.guidance}</label>
      <input type="range" min={1} max={20} step={0.5} value={settings.guidance}
        onChange={e => onChange({ ...settings, guidance: Number(e.target.value) })} />
    </div>
  )
}