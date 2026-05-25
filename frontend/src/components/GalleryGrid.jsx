import React from 'react'
import ImageCard from './ImageCard'

export default function GalleryGrid({ images }) {
  if (images.length === 0)
    return <p className="empty-msg">No images yet. Generate your first one! 🎨</p>

  return (
    <div className="gallery-grid">
      {images.map((img, i) => <ImageCard key={i} image={img} />)}
    </div>
  )
}