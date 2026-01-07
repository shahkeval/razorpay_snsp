import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Gallery.css';

const CLOUD_NAME = 'dpr1x8m0b';

const Gallery = () => {
  // ===============================
  // JATRA (PAGINATED)
  // ===============================
  const [jatraImages, setJatraImages] = useState([]);
  const [jatraLoading, setJatraLoading] = useState(true);
  const [jatraCursor, setJatraCursor] = useState(null);
  const [jatraTotal, setJatraTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchJatraImages = async (loadMore = false) => {
    try {
      loadMore ? setLoadingMore(true) : setJatraLoading(true);

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/gallery/day-1`,
        {
          params: {
            cursor: loadMore ? jatraCursor : undefined,
          },
        }
      );

      const newImages = res.data.images.map((img, index) => ({
        src: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.public_id}`,
        alt: `7 Jatra Day 1 - Image ${jatraImages.length + index + 1}`,
      }));

      setJatraImages((prev) =>
        loadMore ? [...prev, ...newImages] : newImages
      );

      setJatraCursor(res.data.nextCursor);
      setJatraTotal(res.data.total);
    } catch (error) {
      console.error('Failed to load Jatra images:', error);
    } finally {
      setJatraLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchJatraImages(false);
  }, []);

  // ===============================
  // CATEGORIES
  // ===============================
  const categories = [
    { id: 'jatra', name: '7 Jatra 2026', images: jatraImages },
    {
      id: 'palkhi',
      name: 'Palkhi Yatra',
      images: [
        { src: '/images/palkhi/palkhi1.jpg', alt: 'Palkhi Image 1' },
        { src: '/images/palkhi/palkhi2.jpg', alt: 'Palkhi Image 2' },
        { src: '/images/palkhi/palkhi3.jpg', alt: 'Palkhi Image 3' },
        { src: '/images/palkhi/palkhi4.jpg', alt: 'Palkhi Image 4' },
        { src: '/images/palkhi/palkhi5.jpg', alt: 'Palkhi Image 5' },
        { src: '/images/palkhi/palkhi6.jpg', alt: 'Palkhi Image 6' },
        { src: '/images/palkhi/palkhi7.jpg', alt: 'Palkhi Image 7' },
        { src: '/images/palkhi/palkhi8.jpg', alt: 'Palkhi Image 8' },
        { src: '/images/palkhi/palkhi9.jpg', alt: 'Palkhi Image 9' },
        { src: '/images/palkhi/palkhi10.jpg', alt: 'Palkhi Image 10' },
      ],
    },
    {
      id: 'jiv daya',
      name: 'Jiv Daya',
      images: [
        { src: '/images/jiv/jiv1.jpg', alt: 'Jiv Image 1' },
        { src: '/images/jiv/jiv2.jpg', alt: 'Jiv Image 2' },
        { src: '/images/jiv/jiv3.jpg', alt: 'Jiv Image 3' },
        { src: '/images/jiv/jiv4.jpg', alt: 'Jiv Image 4' },
        { src: '/images/jiv/jiv5.jpg', alt: 'Jiv Image 5' },
        { src: '/images/jiv/jiv6.jpg', alt: 'Jiv Image 6' },
        { src: '/images/jiv/jiv7.jpg', alt: 'Jiv Image 7' },
      ],
    },
    {
      id: 'anukampa',
      name: 'Anukampa',
      images: [
        { src: '/images/anukampa/anu1.jpg', alt: 'Anukampa Image 1' },
        { src: '/images/anukampa/anu2.jpg', alt: 'Anukampa Image 2' },
        { src: '/images/anukampa/anu3.jpg', alt: 'Anukampa Image 3' },
        { src: '/images/anukampa/anu4.jpg', alt: 'Anukampa Image 4' },
        { src: '/images/anukampa/anu5.jpg', alt: 'Anukampa Image 5' },
        { src: '/images/anukampa/anu6.jpg', alt: 'Anukampa Image 6' },
        { src: '/images/anukampa/anu7.jpg', alt: 'Anukampa Image 7' },
        { src: '/images/anukampa/anu8.jpg', alt: 'Anukampa Image 8' },
        { src: '/images/anukampa/anu9.jpg', alt: 'Anukampa Image 9' },
        { src: '/images/anukampa/anu10.jpg', alt: 'Anukampa Image 10' },
        { src: '/images/anukampa/anu11.jpg', alt: 'Anukampa Image 11' },
      ],
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (selectedCategory.id === 'jatra') {
      setSelectedCategory(categories[0]);
    }
  }, [jatraImages]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    closeModal();
  };

  const openImageModal = (image, index) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
    setShowModal(true);
  };

const nextImage = async () => {
  const images = selectedCategory.images;

  // 🟢 If next image exists in already loaded images
  if (selectedImageIndex + 1 < images.length) {
    const nextIndex = selectedImageIndex + 1;
    setSelectedImage(images[nextIndex]);
    setSelectedImageIndex(nextIndex);
    return;
  }

  // 🟡 If Jatra & more images exist on server → fetch next batch
  if (
    selectedCategory.id === 'jatra' &&
    jatraCursor &&
    !loadingMore
  ) {
    try {
      setLoadingMore(true);

      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/gallery/day-1`,
        {
          params: { cursor: jatraCursor },
        }
      );

      const newImages = res.data.images.map((img, index) => ({
        src: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.public_id}`,
        alt: `7 Jatra Day 1 - Image ${jatraImages.length + index + 1}`,
      }));

      setJatraImages((prev) => [...prev, ...newImages]);
      setJatraCursor(res.data.nextCursor);

      // 👉 Move modal to first image of newly loaded batch
      const nextIndex = images.length;
      setSelectedImageIndex(nextIndex);
      setSelectedImage({
        src: newImages[0].src,
        alt: newImages[0].alt,
      });
    } catch (err) {
      console.error('Failed to load next images:', err);
    } finally {
      setLoadingMore(false);
    }
  }
};


const prevImage = () => {
  if (selectedImageIndex === 0) return;

  const prevIndex = selectedImageIndex - 1;
  setSelectedImage(selectedCategory.images[prevIndex]);
  setSelectedImageIndex(prevIndex);
};

  const closeModal = () => setShowModal(false);

  // ===============================
  // DOWNLOAD URL
  // ===============================
  const getDownloadUrl = (src) => {
    if (src.includes('res.cloudinary.com')) {
      return src.replace('/image/upload/', '/image/upload/fl_attachment/');
    }
    return src;
  };

  return (
    <div className="gallery-container">
      <h1>Photo Gallery</h1>

      <div className="category-nav">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory.id === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <h2 className="category-title">{selectedCategory.name}</h2>

      <div className="gallery-grid">
        {selectedCategory.id === 'jatra' && jatraLoading ? (
          <div className="gallery-loader">
            <div className="spinner"></div>
            <p>Loading Jatra memories...</p>
          </div>
        ) : (
          <>
            {selectedCategory.images.slice(0, jatraTotal).map((image, index) => (
              <div
                key={index}
                className="gallery-item"
                onClick={() => openImageModal(image, index)}
              >
                <img src={image.src} alt={image.alt} />
                <div className="overlay"><span>View</span></div>
              </div>
            ))}

            {selectedCategory.id === 'jatra' &&
              jatraImages.length < jatraTotal && (
                <div className="view-more-container">
                  <button
                    className="view-more-btn"
                    onClick={() => fetchJatraImages(true)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'View More'}
                  </button>
                  <p className="image-count">
                    Showing {jatraImages.length} of {jatraTotal}
                  </p>
                </div>
              )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedImage.alt}</h3>

              <a
                href={getDownloadUrl(selectedImage.src)}
                download={!selectedImage.src.includes('res.cloudinary.com')}
                className="download-btn"
              >
                ⬇ Download
              </a>

              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <img src={selectedImage.src} alt={selectedImage.alt} className="modal-image" />
              <div className="modal-nav">
                <button className="nav-btn" onClick={prevImage}>&#10094;</button>
                <span>
                  {selectedImageIndex + 1} /{" "}
                  {selectedCategory.id === "jatra"
                    ? jatraTotal
                    : selectedCategory.images.length}
                </span>

                <button className="nav-btn" onClick={nextImage}>&#10095;</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
