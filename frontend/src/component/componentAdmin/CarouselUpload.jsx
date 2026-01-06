import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, Edit2, X, Save } from "lucide-react";
import ImageComponent from "../componentGeneral/ImageComponent.jsx";
import useAuthAdminStore from "../../store/AuthAdminStore.js";

const CarouselUpload = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    heading: "",
    subHeading: "",
    buttonText: "",
    buttonLink: "",
  });
  const [newSlideData, setNewSlideData] = useState({
    heading: "",
    subHeading: "",
    buttonText: "",
    buttonLink: "",
  });
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuthAdminStore();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${apiUrl}/getallcarousel`);
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching images", error);
      }
    };
    fetchImages();
  }, [apiUrl]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("imgSrc", file);
    uploadFormData.append("heading", newSlideData.heading);
    uploadFormData.append("subHeading", newSlideData.subHeading);
    uploadFormData.append("buttonText", newSlideData.buttonText);
    uploadFormData.append("buttonLink", newSlideData.buttonLink);

    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/createcarousel`,
        uploadFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.imgSrc) {
        setImages((prevImages) => [...prevImages, response.data]);
        setNewSlideData({
          heading: "",
          subHeading: "",
          buttonText: "",
          buttonLink: "",
        });
      }
    } catch (error) {
      console.error("Error uploading image", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageDelete = async (imageId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this image? This action cannot be undone."
    );

    if (confirmation) {
      try {
        await axios.delete(`${apiUrl}/deletebyidcarousel/${imageId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setImages((prevImages) =>
          prevImages.filter((image) => image._id !== imageId)
        );
      } catch (error) {
        console.error("Error deleting image", error);
      }
    }
  };

  const handleEdit = (image) => {
    setEditingId(image._id);
    setFormData({
      heading: image.heading || "",
      subHeading: image.subHeading || "",
      buttonText: image.buttonText || "",
      buttonLink: image.buttonLink || "",
    });
  };

  const handleUpdate = async (imageId) => {
    try {
      const response = await axios.put(
        `${apiUrl}/updatecarousel/${imageId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setImages((prevImages) =>
        prevImages.map((img) =>
          img._id === imageId ? { ...img, ...response.data } : img
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating carousel", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      heading: "",
      subHeading: "",
      buttonText: "",
      buttonLink: "",
    });
  };

  return (
    <div className="flex flex-col p-6 shadow bg-white rounded-lg">
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        Manage Hero Slider Images
      </h1>

      {/* New Slide Upload Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-md font-medium mb-4 text-gray-700">Add New Slide</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Heading (Optional)
            </label>
            <input
              type="text"
              value={newSlideData.heading}
              onChange={(e) =>
                setNewSlideData({ ...newSlideData, heading: e.target.value })
              }
              placeholder="e.g., READY TO WEAR"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Sub Heading (Optional)
            </label>
            <input
              type="text"
              value={newSlideData.subHeading}
              onChange={(e) =>
                setNewSlideData({ ...newSlideData, subHeading: e.target.value })
              }
              placeholder="e.g., WINTER '25 - NEW ARRIVALS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Button Text (Optional)
            </label>
            <input
              type="text"
              value={newSlideData.buttonText}
              onChange={(e) =>
                setNewSlideData({ ...newSlideData, buttonText: e.target.value })
              }
              placeholder="e.g., SHOP NOW"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Button Link (Optional)
            </label>
            <input
              type="text"
              value={newSlideData.buttonLink}
              onChange={(e) =>
                setNewSlideData({ ...newSlideData, buttonLink: e.target.value })
              }
              placeholder="e.g., /shop or /shop?category=women"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="cursor-pointer inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition duration-300">
          <Upload className="mr-2" size={18} />
          Select Image & Upload
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {loading && <p className="text-blue-500 mt-3">Uploading...</p>}
      </div>

      {/* Existing Slides */}
      <h2 className="text-md font-medium mb-4 text-gray-700">Existing Slides</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {images.length > 0 ? (
            images.map((image) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
              >
                {/* Image Preview */}
                <div className="relative">
                  <ImageComponent
                    imageName={image.imgSrc}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {editingId !== image._id && (
                      <button
                        onClick={() => handleEdit(image)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow transition duration-300"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleImageDelete(image._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow transition duration-300"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Overlay Text Preview */}
                  {(image.heading || image.subHeading || image.buttonText) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                      {image.heading && (
                        <p className="text-lg font-light">{image.heading}</p>
                      )}
                      {image.subHeading && (
                        <p className="text-sm opacity-90">{image.subHeading}</p>
                      )}
                      {image.buttonText && (
                        <span className="inline-block mt-2 text-xs border border-white px-3 py-1">
                          {image.buttonText}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Form */}
                {editingId === image._id ? (
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Heading
                        </label>
                        <input
                          type="text"
                          value={formData.heading}
                          onChange={(e) =>
                            setFormData({ ...formData, heading: e.target.value })
                          }
                          placeholder="Heading"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Sub Heading
                        </label>
                        <input
                          type="text"
                          value={formData.subHeading}
                          onChange={(e) =>
                            setFormData({ ...formData, subHeading: e.target.value })
                          }
                          placeholder="Sub Heading"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={formData.buttonText}
                          onChange={(e) =>
                            setFormData({ ...formData, buttonText: e.target.value })
                          }
                          placeholder="Button Text"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={formData.buttonLink}
                          onChange={(e) =>
                            setFormData({ ...formData, buttonLink: e.target.value })
                          }
                          placeholder="e.g., /shop"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleUpdate(image._id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm transition"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-xs text-gray-500">
                    {image.buttonLink && (
                      <p>Link: {image.buttonLink}</p>
                    )}
                    {!image.heading && !image.subHeading && !image.buttonText && (
                      <p className="italic">No overlay text configured</p>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2">No slides uploaded yet.</p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CarouselUpload;