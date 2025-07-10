import React, { useState, useEffect } from 'react';
import './Gallery.css';
import Footer from '../components/Footer';

const Gallery = () => {
  // Define categories with their images
  const categories = [
    {
      id: 'jatra',
      name: '7 Jatra',
      images: [
        { src: '/images/jatra/yatra1.JPG', alt: 'Jatra Image 1' },
        { src: '/images/jatra/yatra2.JPG', alt: 'Jatra Image 2' },
        { src: '/images/jatra/yatra3.JPG', alt: 'Jatra Image 3' },
        { src: '/images/jatra/yatra4.jpg', alt: 'Jatra Image 4' },
        { src: '/images/jatra/yatra5.jpg', alt: 'Jatra Image 5' },
        { src: '/images/jatra/yatra6.jpg', alt: 'Jatra Image 6' },
        { src: '/images/jatra/yatra7.jpg', alt: 'Jatra Image 7' },
        { src: '/images/jatra/yatra8.jpg', alt: 'Jatra Image 8' },
        { src: '/images/jatra/yatra9.jpg', alt: 'Jatra Image 9' },
        { src: '/images/jatra/yatra10.jpg', alt: 'Jatra Image 10' },
        { src: '/images/jatra/yatra11.jpg', alt: 'Jatra Image 11' },
      ]
    },
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
      ]
    },
    {
      id: 'jiv daya',
      name: 'Jiv Daya',
      images: [
        { src: '/images/jiv/jiv1.jpg', alt: 'jiv Image 1' },
        { src: '/images/jiv/jiv2.jpg', alt: 'jiv Image 2' },
        { src: '/images/jiv/jiv3.jpg', alt: 'jiv Image 3' },
        { src: '/images/jiv/jiv4.jpg', alt: 'jiv Image 4' },
        { src: '/images/jiv/jiv5.jpg', alt: 'jiv Image 5' },
        { src: '/images/jiv/jiv6.jpg', alt: 'jiv Image 6' },
        { src: '/images/jiv/jiv7.jpg', alt: 'jiv Image 7' },
      ]
    },
    {
      id: 'anukampa ',
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
      ]
    },
    // You can add more categories as needed
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isViewMoreModal, setIsViewMoreModal] = useState(false);

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedImage(null);
    setShowModal(false);
  };

  // Open image modal
  const openImageModal = (image, index) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
    setShowModal(true);
    setIsViewMoreModal(false);
  };

  // Open view more modal
  const openViewMoreModal = () => {
    setIsViewMoreModal(true);
    setShowModal(true);
    setSelectedImageIndex(0);
    setSelectedImage(selectedCategory.images[0]);
  };

  // Navigate to next image
  const nextImage = () => {
    const images = selectedCategory.images;
    const nextIndex = (selectedImageIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
    setSelectedImageIndex(nextIndex);
  };

  // Navigate to previous image
  const prevImage = () => {
    const images = selectedCategory.images;
    const prevIndex = (selectedImageIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
    setSelectedImageIndex(prevIndex);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setIsViewMoreModal(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showModal) return;
      
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal, selectedImageIndex]);

  return (
    <>
    <div className="gallery-container">
      <h1>Photo Gallery</h1>
      
      {/* Category Navigation */}
      <div className="category-nav">
        {categories.map(category => (
          <button 
            key={category.id}
            className={`category-btn ${selectedCategory.id === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Current Category Title */}
      <h2 className="category-title">{selectedCategory.name}</h2>
      
      {/* Gallery Grid */}
      <div className="gallery-grid">
        {selectedCategory.images.slice(0, 5).map((image, index) => (
          <div 
            key={index} 
            className="gallery-item"
            onClick={() => openImageModal(image, index)}
          >
            <img src={image.src} alt={image.alt} />
            <div className="overlay">
              <span>View</span>
            </div>
          </div>
        ))}
        
        {/* View More Button (if more than 6 images) */}
        {selectedCategory.images.length > 6 && (
          <div className="view-more-container">
            <button className="view-more-btn" onClick={openViewMoreModal}>
              View More
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h3>{isViewMoreModal ? `All ${selectedCategory.name} Images` : selectedImage.alt}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            {/* Modal Body */}
            <div className="modal-body">
              <img 
                src={selectedImage.src} 
                alt={selectedImage.alt} 
                className="modal-image" 
              />
              
              {/* Navigation Controls */}
              <div className="modal-nav">
                <button className="nav-btn prev-btn" onClick={prevImage}>
                  &#10094;
                </button>
                <div className="image-counter">
                  {selectedImageIndex + 1} / {selectedCategory.images.length}
                </div>
                <button className="nav-btn next-btn" onClick={nextImage}>
                  &#10095;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default Gallery;