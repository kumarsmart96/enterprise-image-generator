import React, { useState, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function App() {
  const [prompt, setPrompt]         = useState('')
  const [mode, setMode]             = useState('text2img')
  const [steps, setSteps]           = useState(6)
  const [strength, setStrength]     = useState(0.5)
  const [images, setImages]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [history, setHistory]       = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadPreview, setUploadPreview] = useState(null)
  const fileRef = useRef()

  // ── Upload image ──────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadedFile(file)
    setUploadPreview(URL.createObjectURL(file))

    const endpoint = mode === 'img2img_style'
      ? 'upload_assets'
      : 'upload_content'

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await axios.post(`${API}/${endpoint}`, form)
      alert(res.data.message)
    } catch {
      alert('Upload failed!')
    }
  }

  // ── Generate ──────────────────────────────────────────────
  const generate = async () => {
    if (!prompt.trim()) { setError('Enter a prompt!'); return }
    setLoading(true); setError(''); setImages([])

    try {
      const res = await axios.post(`${API}/generate`, {
        prompt,
        mode,
        n_images       : 1,
        steps,
        guidance_scale : 1.0,
        width          : 512,
        height         : 512,
        style_strength : strength,
      })

      const urls = res.data.image_urls
      setImages(urls)
      setHistory(h => [{
        prompt,
        mode,
        urls,
        time: new Date().toLocaleTimeString()
      }, ...h.slice(0, 9)])

    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>

      {/* ── Header ── */}
      <div style={S.header}>
        <h1 style={S.h1}>🎨 Enterprise Image Generator</h1>
        <p style={S.sub}>LCM Model · Fast CPU Generation</p>
      </div>

      <div style={S.body}>

        {/* ── LEFT PANEL ── */}
        <div style={S.left}>

          {/* Prompt */}
          <div style={S.card}>
            <div style={S.cardTitle}>✍️ Prompt</div>
            <textarea
              style={S.textarea}
              rows={4}
              placeholder="a red sports car, sunset, photorealistic..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.ctrlKey && e.key === 'Enter' && generate()}
            />
            <div style={S.hint}>Ctrl + Enter to generate</div>
          </div>

          {/* Mode */}
          <div style={S.card}>
            <div style={S.cardTitle}>⚙️ Mode</div>
            {[
              { v: 'text2img',        l: '✍️ Text to Image',   d: 'Generate from prompt only'     },
              { v: 'img2img_style',   l: '🎨 Style Reference', d: 'Use uploaded image as style'   },
              { v: 'img2img_content', l: '🖼️ Transform Image', d: 'Transform your uploaded image' },
            ].map(m => (
              <div key={m.v}
                style={{ ...S.modeBtn, ...(mode === m.v ? S.modeBtnOn : {}) }}
                onClick={() => { setMode(m.v); setUploadedFile(null); setUploadPreview(null) }}>
                <b>{m.l}</b>
                <span style={S.modeDesc}>{m.d}</span>
              </div>
            ))}
          </div>

          {/* Upload — only for img2img modes */}
          {mode !== 'text2img' && (
            <div style={S.card}>
              <div style={S.cardTitle}>
                {mode === 'img2img_style' ? '🎨 Upload Style Image' : '🖼️ Upload Image to Transform'}
              </div>

              {/* Drop zone */}
              <div style={S.dropzone} onClick={() => fileRef.current.click()}>
                {uploadPreview
                  ? <img src={uploadPreview} alt="preview" style={S.uploadPreview}/>
                  : <div style={S.dropText}>
                      <div style={{fontSize: '32px'}}>📁</div>
                      <div>Click to upload image</div>
                      <div style={{fontSize:'12px',color:'#6b6a7a'}}>PNG, JPG supported</div>
                    </div>
                }
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {uploadedFile && (
                <div style={S.uploadedName}>✅ {uploadedFile.name}</div>
              )}
            </div>
          )}

          {/* Settings */}
          <div style={S.card}>
            <div style={S.cardTitle}>🎛️ Settings</div>

            <div style={S.sliderRow}>
              <span>Steps: {steps}</span>
              <span style={S.sliderHint}>fewer = faster</span>
            </div>
            <input type="range" min="4" max="12" value={steps}
              onChange={e => setSteps(+e.target.value)} style={S.slider}/>

            {mode !== 'text2img' && <>
              <div style={S.sliderRow}>
                <span>Style Strength: {strength}</span>
                <span style={S.sliderHint}>higher = more style</span>
              </div>
              <input type="range" min="0.1" max="0.9" step="0.1" value={strength}
                onChange={e => setStrength(+e.target.value)} style={S.slider}/>
            </>}

            {/* Speed info */}
            <div style={S.speedBox}>
              ⚡ LCM Model: ~{steps * 20}s on CPU
            </div>
          </div>

          {/* Generate button */}
          <button style={{...S.btn, ...(loading ? S.btnOff : {})}}
            onClick={generate} disabled={loading}>
            {loading ? '⏳ Generating...' : '🚀 Generate Image'}
          </button>

          {error && <div style={S.errBox}>{error}</div>}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={S.right}>

          {/* Result */}
          <div style={S.card}>
            <div style={S.cardTitle}>🖼️ Generated Images</div>

            {loading && (
              <div style={S.loadBox}>
                <div style={{fontSize:'48px'}}>⏳</div>
                <div style={S.loadTitle}>Generating on CPU...</div>
                <div style={S.loadSub}>Using LCM model with {steps} steps</div>
                <div style={S.loadSub}>Estimated: ~{steps * 20} seconds</div>
                <div style={S.loadSub}>Do not close the browser!</div>
                <div style={S.progressBar}>
                  <div style={S.progressFill}/>
                </div>
              </div>
            )}

            {!loading && images.length === 0 && (
              <div style={S.emptyBox}>
                <div style={{fontSize:'48px'}}>🎨</div>
                <div>Enter a prompt and click Generate</div>
                <div style={{fontSize:'13px',marginTop:'8px',color:'#6b6a7a'}}>
                  LCM model generates in 4-8 steps
                </div>
              </div>
            )}

            <div style={S.imgGrid}>
              {images.map((url, i) => (
                <div key={i} style={S.imgCard}>
                  <img src={`${API}${url}`} alt={`result ${i}`} style={S.img}/>
                  <a href={`${API}${url}`} download={`image_${i}.png`}
                    style={S.dlBtn}>⬇️ Download</a>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>📋 Prompt History</div>
              {history.map((h, i) => (
                <div key={i} style={S.histRow}
                  onClick={() => { setPrompt(h.prompt); setMode(h.mode) }}>
                  <div style={S.histLeft}>
                    <span style={S.histBadge}>{h.mode}</span>
                    <span style={S.histTime}>{h.time}</span>
                  </div>
                  <div style={S.histPrompt}>{h.prompt.slice(0, 80)}</div>
                  {h.urls[0] && (
                    <img src={`${API}${h.urls[0]}`} alt=""
                      style={S.histThumb}/>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const S = {
  page      : { minHeight:'100vh', background:'#0f0f13', color:'#f0eff8', fontFamily:'system-ui,sans-serif' },
  header    : { background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'28px 32px', textAlign:'center', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  h1        : { fontSize:'2rem', fontWeight:800, margin:0, background:'linear-gradient(135deg,#7c6dfa,#fa6d9a)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  sub       : { color:'#6b6a7a', marginTop:'6px', fontSize:'13px' },
  body      : { display:'flex', gap:'20px', padding:'20px', maxWidth:'1200px', margin:'0 auto' },
  left      : { width:'360px', flexShrink:0, display:'flex', flexDirection:'column', gap:'14px' },
  right     : { flex:1, display:'flex', flexDirection:'column', gap:'14px' },
  card      : { background:'#16161f', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'18px' },
  cardTitle : { fontSize:'13px', fontWeight:700, color:'#6b6a7a', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'14px' },
  textarea  : { width:'100%', background:'#0f0f13', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#f0eff8', fontSize:'14px', padding:'12px', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' },
  hint      : { fontSize:'11px', color:'#6b6a7a', marginTop:'6px' },
  modeBtn   : { padding:'10px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', marginBottom:'8px', display:'flex', flexDirection:'column', gap:'2px' },
  modeBtnOn : { border:'1px solid #7c6dfa', background:'rgba(124,109,250,0.1)' },
  modeDesc  : { fontSize:'12px', color:'#6b6a7a' },
  dropzone  : { border:'2px dashed rgba(255,255,255,0.1)', borderRadius:'10px', padding:'20px', textAlign:'center', cursor:'pointer', minHeight:'100px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'10px' },
  dropText  : { display:'flex', flexDirection:'column', gap:'6px', alignItems:'center', color:'#6b6a7a', fontSize:'14px' },
  uploadPreview: { maxWidth:'100%', maxHeight:'150px', borderRadius:'8px' },
  uploadedName: { fontSize:'12px', color:'#1D9E75', marginTop:'4px' },
  sliderRow : { display:'flex', justifyContent:'space-between', marginBottom:'6px', fontSize:'13px' },
  sliderHint: { fontSize:'11px', color:'#6b6a7a' },
  slider    : { width:'100%', accentColor:'#7c6dfa', marginBottom:'14px' },
  speedBox  : { background:'rgba(124,109,250,0.08)', border:'1px solid rgba(124,109,250,0.2)', borderRadius:'8px', padding:'8px 12px', fontSize:'12px', color:'#7c6dfa', textAlign:'center' },
  btn       : { width:'100%', padding:'16px', background:'linear-gradient(135deg,#7c6dfa,#fa6d9a)', border:'none', borderRadius:'12px', color:'white', fontSize:'16px', fontWeight:700, cursor:'pointer' },
  btnOff    : { opacity:0.6, cursor:'not-allowed' },
  errBox    : { background:'rgba(234,67,53,0.1)', border:'1px solid rgba(234,67,53,0.3)', borderRadius:'8px', padding:'12px', color:'#ea4335', fontSize:'13px' },
  loadBox   : { textAlign:'center', padding:'40px 20px', color:'#6b6a7a' },
  loadTitle : { fontSize:'16px', fontWeight:600, color:'#f0eff8', margin:'12px 0 6px' },
  loadSub   : { fontSize:'13px', margin:'3px 0' },
  progressBar: { width:'80%', height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', margin:'16px auto 0', overflow:'hidden' },
  progressFill: { height:'100%', width:'60%', background:'linear-gradient(90deg,#7c6dfa,#fa6d9a)', borderRadius:'2px', animation:'progress 2s ease infinite' },
  emptyBox  : { textAlign:'center', padding:'40px 20px', color:'#6b6a7a', fontSize:'14px' },
  imgGrid   : { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px', marginTop:'10px' },
  imgCard   : { borderRadius:'10px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' },
  img       : { width:'100%', display:'block' },
  dlBtn     : { display:'block', textAlign:'center', padding:'10px', background:'#1a1a2e', color:'#7c6dfa', textDecoration:'none', fontSize:'13px', fontWeight:600 },
  histRow   : { display:'flex', alignItems:'center', gap:'10px', padding:'10px', borderRadius:'8px', cursor:'pointer', marginBottom:'6px', background:'#0f0f13', flexWrap:'wrap' },
  histLeft  : { display:'flex', gap:'8px', alignItems:'center', width:'100%' },
  histBadge : { fontSize:'10px', padding:'2px 8px', borderRadius:'20px', background:'rgba(124,109,250,0.2)', color:'#7c6dfa', fontWeight:600 },
  histTime  : { fontSize:'11px', color:'#6b6a7a' },
  histPrompt: { fontSize:'12px', color:'#6b6a7a', flex:1 },
  histThumb : { width:'40px', height:'40px', borderRadius:'6px', objectFit:'cover' },
}