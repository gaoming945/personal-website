import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';

// BASE_URL 根路径构建时为 "/"，子路径构建时为 "/personal-website"（无尾斜杠），统一补齐尾斜杠再拼接。
const BASE_URL = import.meta.env.BASE_URL.replace(/\/?$/, '/');

interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface FitnessRecord {
  title: string;
  image: string;
  width?: number;
  height?: number;
  visible?: boolean;
}

interface PhotoTileProps {
  photo: Photo;
  index: number;
  compact?: boolean;
}

const PhotoTile = memo(function PhotoTile({ photo, index, compact = false }: PhotoTileProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.article
      className={`fitness-photo-tile${compact ? ' is-compact' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.42, delay: Math.min(index * 0.04, 0.28) }}
    >
      <div className="fitness-photo-frame">
        {!loaded && <div className="photo-skeleton" />}
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          width={photo.width}
          height={photo.height}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />
        <div className="fitness-photo-shield" aria-hidden="true" />
      </div>
      <div className="fitness-photo-meta">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <strong>{photo.alt}</strong>
      </div>
    </motion.article>
  );
});

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}api/public/content`)
      .then(res => res.json())
      .then(data => {
        const managedPhotos = Array.isArray(data.fitness)
          ? data.fitness
              .filter((item: FitnessRecord) => item.visible !== false && item.image)
              .map((item: FitnessRecord) => ({
                src: item.image,
                alt: item.title,
                width: item.width || 800,
                height: item.height || 600,
              }))
          : [];
        setPhotos(managedPhotos);
        setLoading(false);
      })
      .catch(() => {
        fetch(`${BASE_URL}photos.json`)
          .then(res => res.json())
          .then(data => setPhotos(data))
          .finally(() => setLoading(false));
      });
  }, []);

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="loading-spinner" />
        <p>Loading photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="gallery-loading">
        <p>No photos available.</p>
      </div>
    );
  }

  const rows = [
    photos,
    [...photos].reverse(),
  ];
  const repeatedRows = rows.map(row => [...row, ...row]);

  return (
    <div className="fitness-wall">
      <div className="fitness-wall-header">
        <div>
          <span>Training Archive</span>
          <strong>{photos.length} frames</strong>
        </div>
        <p>low-res preview only</p>
      </div>
      <div className="fitness-motion-wall" aria-label="Fitness photo wall">
        {repeatedRows.map((row, rowIndex) => (
          <div className={`fitness-marquee-row${rowIndex === 1 ? ' is-reverse' : ''}`} key={rowIndex}>
            <div className="fitness-marquee-track">
              {row.map((photo, index) => (
                <PhotoTile
                  key={`${rowIndex}-${index}-${photo.src}`}
                  photo={photo}
                  index={index % photos.length}
                  compact={rowIndex === 1}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
