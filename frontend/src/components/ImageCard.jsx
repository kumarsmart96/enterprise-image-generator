import React from 'react'

export default function ImageCard({ image }) {
  return (
    <div className="image-card">
      <img 
        src={image.url} 
        alt={image.prompt}
        onError={(e) => {
          console.error('Image failed to load:', image.url)
          e.target.style.display = 'none'
        }}
        onLoad={() => console.log('Image loaded successfully!')}
      />
      <div className="image-card-info">
        <p className="image-card-prompt">{image.prompt}</p>
        <a 
          href={image.url} 
          target="_blank"
          rel="noreferrer"
          download={image.filename} 
          className="download-btn"
        >
          ⬇ Download
        </a>
      </div>
    </div>
  )
}