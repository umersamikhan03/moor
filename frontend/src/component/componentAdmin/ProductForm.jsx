import React, { useRef, useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCategoryStore from "../../store/useCategoryStore.js";
import useSubCategoryStore from "../../store/useSubCategoryStore.js";
import useChildCategoryStore from "../../store/useChildCategoryStore.js";
import useFlagStore from "../../store/useFlagStore.js";
import useProductSizeStore from "../../store/useProductSizeStore.js";
import AuthAdminStore from "../../store/AuthAdminStore.js";
import useProductStore from "../../store/useProductStore.js";
const Editor = lazy(() =>
  import("primereact/editor").then((module) => ({ default: module.Editor })),
);
import {
  Box,
  MenuItem,
  Select,
  Typography,
  Chip,
  Input,
  ListItemText,
  Checkbox,
  FormHelperText,
  FormControl,
  TextField,
  InputAdornment,
  Button,
  InputLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Switch,
  Snackbar,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import Skeleton from "react-loading-skeleton";

const ProductForm = ({ isEdit: isEditMode }) => {
  const { slug } = useParams();

  const { fetchProductBySlug, product } = useProductStore();
  const { categories } = useCategoryStore();
  const { subCategories } = useSubCategoryStore();
  const { childCategories } = useChildCategoryStore();
  const { flags } = useFlagStore();
  const { productSizes } = useProductSizeStore();
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = AuthAdminStore();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [sizeChart, setSizeChart] = useState("");
  const [shippingReturn, setShippingReturn] = useState("");
  const [productCode, setProductCode] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [filteredChildCategories, setFilteredChildCategories] = useState([]);
  const [selectedChildCategory, setSelectedChildCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [searchTags, setSearchTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [finalPrice, setFinalPrice] = useState("");
  const [finalDiscount, setFinalDiscount] = useState("");
  const [finalStock, setFinalStock] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [selectedFlags, setSelectedFlags] = useState([]);
  const [hasVariant, setHasVariant] = useState(true);
  const [variants, setVariants] = useState([
    { size: "", stock: "", price: "", discount: "" },
  ]);
  const [isActive, setIsActive] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const imageUrl = `${apiUrl.replace("/api", "")}/uploads`;

  useEffect(() => {
    if (isEditMode && slug) {
      fetchProductBySlug(slug);
    }
  }, [slug, isEditMode, fetchProductBySlug]);

  useEffect(() => {
    if (isEditMode && product) {
      setName(product.name || "");
      setShortDesc(product.shortDesc || "");
      setLongDesc(product.longDesc || "");
      setSizeChart(product.sizeChart || "");
      setShippingReturn(product.shippingReturn || "");
      setProductCode(product.productCode || "");
      setIsActive(String(product.isActive));
      setRewardPoints(product.rewardPoints || "");
      setVideoUrl(product.videoUrl || "");
      setMetaTitle(product.metaTitle || "");
      setMetaDescription(product.metaDescription || "");
      setMetaKeywords(product.metaKeywords || []);
      setSearchTags(product.searchTags || []);
      setFinalPrice(product.finalPrice || "");
      setFinalDiscount(product.finalDiscount || "");
      setFinalStock(product.finalStock || "");
      setPurchasePrice(product.purchasePrice || "");
      setSelectedFlags(product.flags?.map((f) => f._id) || []);
      setExistingImages(product.images || []);

      if (product.category) {
        setSelectedCategory(product.category._id);
        const filteredSubs = subCategories.filter(
          (sub) => sub.category._id === product.category._id,
        );
        setFilteredSubCategories(filteredSubs);

        if (product.subCategory) {
          setSelectedSubCategory(product.subCategory._id);
          const filteredChilds = childCategories.filter(
            (child) => child.subCategory._id === product.subCategory._id,
          );
          setFilteredChildCategories(filteredChilds);

          if (product.childCategory) {
            setSelectedChildCategory(product.childCategory._id);
          }
        }
      }

      if (product.thumbnailImage) {
        setImagePreview(`${imageUrl}/${product.thumbnailImage}`);
      }

      if (product.variants && product.variants.length > 0) {
        setVariants(
          product.variants.map((v) => ({
            size: v.size._id,
            stock: v.stock,
            price: v.price,
            discount: v.discount || "",
          })),
        );
        setHasVariant(true);
      } else {
        setHasVariant(false);
      }
    }
  }, [product, isEditMode, subCategories, childCategories, apiUrl]);

  const handleToggle = () => {
    setHasVariant(!hasVariant);
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { size: "", stock: "", price: "", discount: "" },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleMultipleImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => file);
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((prevImages) => [...prevImages, ...newImages]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveNewImage = (index) => {
    setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => {
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });

    if (imagesInputRef.current && selectedImages.length === 1) {
      imagesInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAllNewImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
    if (imagesInputRef.current) {
      imagesInputRef.current.value = "";
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnailImage(file);
      setImagePreview(imageUrl);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!searchTags.includes(tagInput.trim())) {
        setSearchTags([...searchTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setSearchTags(searchTags.filter((tag) => tag !== tagToDelete));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setSelectedChildCategory("");

    const filtered = subCategories.filter(
      (sub) => sub.category._id === categoryId,
    );
    setFilteredSubCategories(filtered);
  };

  const handleSubCategoryChange = (e) => {
    const subCategoryId = e.target.value;
    setSelectedSubCategory(subCategoryId);
    setSelectedChildCategory("");

    const filtered = childCategories.filter(
      (child) => child.subCategory._id === subCategoryId,
    );
    setFilteredChildCategories(filtered);
  };

  const handleChildCategoryChange = (e) => {
    setSelectedChildCategory(e.target.value);
  };

  const handleFlagChange = (e) => {
    setSelectedFlags(e.target.value);
  };

  const handleFinalPriceChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalPrice(value);
  };

  const handleDiscountChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalDiscount(value);
  };

  const handleFinalStockChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setFinalStock(value);
  };

  const handleRewardPointsChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setRewardPoints(value);
  };

  const handlePurchasePriceChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    setPurchasePrice(value);
  };

  const handleAddKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim() !== "") {
      e.preventDefault();
      if (!metaKeywords.includes(keywordInput.trim())) {
        setMetaKeywords([...metaKeywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => {
    setMetaKeywords(
      metaKeywords.filter((keyword) => keyword !== keywordToDelete),
    );
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let validationErrors = {};
    if (!name.trim()) validationErrors.name = "Product name is required.";
    if (!selectedCategory) validationErrors.category = "Category is required.";

    if (isEditMode) {
      if (!imagePreview && !product.thumbnailImage)
        validationErrors.thumbnailImage = "Thumbnail image is required.";
    } else {
      if (!(thumbnailImage instanceof File)) {
        validationErrors.thumbnailImage = "Thumbnail image is required.";
      }
    }

    if (existingImages.length + selectedImages.length === 0) {
      validationErrors.images = "At least one image is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("shortDesc", shortDesc);
    formData.append("longDesc", longDesc);
    formData.append("sizeChart", sizeChart);
    formData.append("shippingReturn", shippingReturn);
    formData.append("productCode", productCode);
    formData.append("rewardPoints", rewardPoints);
    formData.append("videoUrl", videoUrl);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("finalPrice", finalPrice);
    formData.append("finalDiscount", finalDiscount);
    formData.append("finalStock", finalStock);
    formData.append("purchasePrice", purchasePrice);

    if (isEditMode) {
      formData.append("isActive", isActive);
    }

    if (selectedCategory) formData.append("category", selectedCategory);
    if (selectedSubCategory)
      formData.append("subCategory", selectedSubCategory);
    if (selectedChildCategory)
      formData.append("childCategory", selectedChildCategory);

    if (selectedFlags.length > 0) {
      selectedFlags.forEach((flag) => formData.append("flags", flag));
    }
    if (searchTags.length > 0) {
      searchTags.forEach((tag) => formData.append("searchTags", tag));
    }
    if (metaKeywords.length > 0) {
      metaKeywords.forEach((keyword) =>
        formData.append("metaKeywords", keyword),
      );
    }

    if (thumbnailImage instanceof File) {
      formData.append("thumbnailImage", thumbnailImage);
    }

    if (isEditMode) {
      existingImages.forEach((imageName) => {
        formData.append("existingImages", imageName);
      });
      imagesToDelete.forEach((imageUrl) => {
        formData.append("imagesToDelete", imageUrl);
      });
    }

    selectedImages.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    if (isEditMode) {
      if (variants.length > 0) {
        variants.forEach((variant, index) => {
          if (variant.size && variant.stock && variant.price) {
            Object.keys(variant).forEach((key) => {
              formData.append(`variants[${index}][${key}]`, variant[key]);
            });
          }
        });
      } else {
        formData.append("variants", JSON.stringify([]));
      }
    } else {
      if (variants.length > 0) {
        variants.forEach((variant, index) => {
          if (!variant.size || !variant.stock || !variant.price) {
            return;
          }
          Object.keys(variant).forEach((key) => {
            formData.append(`variants[${index}][${key}]`, variant[key]);
          });
        });
      }
    }

    try {
      if (isEditMode) {
        await axios.put(`${apiUrl}/products/${product.productId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSnackbarMessage("Product updated successfully!");
        setImagesToDelete([]);
      } else {
        await axios.post(`${apiUrl}/products`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage("Product created successfully!");
        setName("");
        setShortDesc("");
        setLongDesc("");
        setSizeChart("");
        setShippingReturn("");
        setProductCode("");
        setRewardPoints("");
        setVideoUrl("");
        setMetaTitle("");
        setMetaDescription("");
        setFinalPrice("");
        setFinalDiscount("");
        setFinalStock("");
        setPurchasePrice("");
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSelectedChildCategory("");
        setSelectedFlags([]);
        setSearchTags([]);
        setMetaKeywords([]);
        setThumbnailImage(null);
        setImagePreview("");
        setSelectedImages([]);
        setImagePreviews([]);
        setVariants([{ size: "", stock: "", price: "", discount: "" }]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (imagesInputRef.current) imagesInputRef.current.value = "";
      }

      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      setTimeout(() => {
        navigate("/admin/viewallproducts");
      }, 3000);
    } catch (error) {
      setSnackbarMessage(
        isEditMode ? "Failed to update product." : "Failed to create product.",
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  if (isEditMode && !product) {
    return (
      <div>
        <Skeleton height={40} width={300} />
        <div className={"grid grid-cols-12 gap-8"}>
          <div className={"col-span-8"}>
            <Skeleton height={400} />
            <Skeleton height={200} className="mt-4" />
          </div>
          <div className={"col-span-4"}>
            <Skeleton height={250} />
            <Skeleton height={300} className="mt-4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={"shadow rounded-lg p-3"}>
      <h1 className="border-l-4 primaryBorderColor primaryTextColor mb-6 pl-2 text-lg font-semibold">
        {isEditMode ? "Update Product" : "Add New Product"}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className={"md:grid grid-cols-12 gap-8 p-3"}>
          <div className={"col-span-8"}>
            <TextField
              label="Product Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Short Description"
              fullWidth
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
            <h1 className={"py-3 pl-1"}>Long Description</h1>
            <Suspense fallback={<Skeleton height={260} />}>
              <Editor
                value={longDesc}
                onTextChange={(e) => setLongDesc(e.htmlValue)}
                style={{ height: "260px" }}
              />
            </Suspense>
            <div>
              <h1 className={"py-3 pl-1"}>Size Chart</h1>
              <Suspense fallback={<Skeleton height={260} />}>
                <Editor
                  value={sizeChart}
                  onTextChange={(e) => setSizeChart(e.htmlValue)}
                  style={{ height: "260px" }}
                />
              </Suspense>
            </div>
            <div>
              <h1 className={"py-3 pl-1"}>Shipping and Return</h1>
              <Suspense fallback={<Skeleton height={260} />}>
                <Editor
                  value={shippingReturn}
                  onTextChange={(e) => setShippingReturn(e.htmlValue)}
                  style={{ height: "260px" }}
                />
              </Suspense>
            </div>
            <Box mb={2}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                margin="normal"
              >
                <TextField
                  label="Search Tags"
                  fullWidth
                  placeholder="Type a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: searchTags.length > 0 && (
                      <InputAdornment position="start">
                        <Box gap={1}>
                          {searchTags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              onDelete={() => handleDeleteTag(tag)}
                              size="small"
                              style={{
                                margin: "2px",
                                backgroundColor: "#e0e0e0",
                              }}
                            />
                          ))}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TextField
                label="Video URL"
                fullWidth
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                margin="normal"
              />
            </Box>
          </div>
          <div className={"col-span-4"}>
            <Box mb={2}>
              <Typography>
                Product Thumbnail Image{" "}
                <span style={{ color: "red", fontSize: "18px" }}>*</span>
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "inline-block" }}
                id="thumbnail-upload"
                name="thumbnailImage"
                ref={fileInputRef}
                required={!isEditMode}
              />
              <label
                htmlFor="thumbnail-upload"
                style={{
                  display: "block",
                  height: "210px",
                  marginTop: "10px",
                  border: "2px solid #aaa",
                  cursor: "pointer",
                  textAlign: "center",
                  position: "relative",
                  backgroundImage: imagePreview
                    ? `url(${imagePreview})`
                    : "none",
                  backgroundColor: imagePreview ? "transparent" : "#f0f0f0",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  color: imagePreview ? "transparent" : "#000",
                }}
              >
                {imagePreview ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      Image Selected
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        zIndex: 10,
                      }}
                      onClick={handleRemoveThumbnail}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    Click to upload an image
                  </Typography>
                )}
              </label>
              {errors.thumbnailImage && (
                <FormHelperText error>{errors.thumbnailImage}</FormHelperText>
              )}
            </Box>

            {!hasVariant && (
              <>
                <TextField
                  label="Price (In BDT)"
                  type="number"
                  fullWidth
                  value={finalPrice}
                  onChange={handleFinalPriceChange}
                  margin="normal"
                  required={!hasVariant}
                />
                <TextField
                  label="Discount Price"
                  type="number"
                  fullWidth
                  value={finalDiscount}
                  onChange={handleDiscountChange}
                  margin="normal"
                />
                <TextField
                  label="Stock"
                  type="number"
                  fullWidth
                  value={finalStock}
                  onChange={handleFinalStockChange}
                  required={!hasVariant}
                  margin="normal"
                />
              </>
            )}

            {isEditMode && (
              <Box sx={{ minWidth: 200, my: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-select-label">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    value={isActive}
                    label="Status"
                    onChange={(e) => setIsActive(e.target.value)}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            <TextField
              label="Reward Points"
              type="number"
              fullWidth
              value={rewardPoints}
              onChange={handleRewardPointsChange}
              margin="normal"
            />
            <TextField
              label="Purchase Price"
              type="number"
              fullWidth
              value={purchasePrice}
              onChange={handlePurchasePriceChange}
              margin="normal"
            />
            <TextField
              label="Product Code"
              fullWidth
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              margin="normal"
            />

            <FormControl
              fullWidth
              error={Boolean(errors.category)}
              margin="normal"
            >
              <InputLabel required>Select Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                required
                label="Select Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              error={Boolean(errors.subCategory)}
              margin="normal"
              disabled={!selectedCategory}
            >
              <InputLabel>Select Sub Category</InputLabel>
              <Select
                value={selectedSubCategory}
                onChange={handleSubCategoryChange}
                label="Select Sub Category"
              >
                {filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((sub) => (
                    <MenuItem key={sub._id} value={sub._id}>
                      {sub.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No subcategories available</MenuItem>
                )}
              </Select>
            </FormControl>

            <FormControl
              fullWidth
              error={Boolean(errors.childCategory)}
              margin="normal"
              disabled={!selectedSubCategory}
            >
              <InputLabel>Select Child Category</InputLabel>
              <Select
                value={selectedChildCategory}
                onChange={handleChildCategoryChange}
                label="Select Child Category"
              >
                {filteredChildCategories.length > 0 ? (
                  filteredChildCategories.map((child) => (
                    <MenuItem key={child._id} value={child._id}>
                      {child.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No child categories available</MenuItem>
                )}
              </Select>
            </FormControl>

            <Box mb={2}>
              <Typography>Select Flags</Typography>
              <Select
                multiple
                fullWidth
                value={selectedFlags}
                onChange={handleFlagChange}
                input={<Input />}
                renderValue={(selected) => (
                  <div>
                    {" "}
                    {selected.map((flagId) => {
                      const flag = flags.find((f) => f._id === flagId);
                      return flag ? (
                        <Chip
                          key={flag._id}
                          label={flag.name}
                          style={{ margin: 2 }}
                        />
                      ) : null;
                    })}{" "}
                  </div>
                )}
              >
                {flags.map((flag) => (
                  <MenuItem key={flag._id} value={flag._id}>
                    {" "}
                    <Checkbox
                      checked={selectedFlags.indexOf(flag._id) > -1}
                    />{" "}
                    <ListItemText primary={flag.name} />{" "}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </div>
        </div>

        <div className={"shadow rounded-lg p-3 mt-3"}>
          <Box mb={2}>
            <Typography>
              Product Images{" "}
              <span style={{ color: "red", fontSize: "18px" }}>*</span>
            </Typography>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImagesChange}
              style={{ display: "block" }}
              id="multi-image-upload"
              name="images"
              ref={imagesInputRef}
              required={!isEditMode && selectedImages.length === 0}
            />
            <label
              htmlFor="multi-image-upload"
              style={{
                marginTop: "10px",
                border: "2px solid #aaa",
                cursor: "pointer",
                textAlign: "center",
                position: "relative",
                backgroundColor:
                  existingImages.length + selectedImages.length > 0
                    ? "transparent"
                    : "#f0f0f0",
                overflow: "hidden",
                padding: "10px",
                display: "flex",
                gap: "15px",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "150px",
              }}
            >
              {existingImages.length > 0 || selectedImages.length > 0 ? (
                <>
                  {selectedImages.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAllNewImages();
                      }}
                      type="button"
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      {isEditMode ? "Remove New Images" : "Remove All"}
                    </button>
                  )}
                  <div
                    className={
                      "flex gap-5 flex-wrap mt-7 justify-center items-center"
                    }
                  >
                    {isEditMode &&
                      existingImages.map((image, index) => (
                        <div
                          key={`existing-${index}`}
                          style={{
                            width: "150px",
                            height: "150px",
                            marginTop: "5px",
                            backgroundImage: `url(${imageUrl}/${image})`,
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            borderRadius: "5px",
                            position: "relative",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveExistingImage(index);
                            }}
                            type="button"
                            style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-5px",
                              background: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    {imagePreviews.map((image, index) => (
                      <div
                        key={`new-${index}`}
                        style={{
                          width: "150px",
                          height: "150px",
                          marginTop: "5px",
                          backgroundImage: `url(${image})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          borderRadius: "5px",
                          position: "relative",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNewImage(index);
                          }}
                          type="button"
                          style={{
                            position: "absolute",
                            top: "-5px",
                            right: "-5px",
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  Click to upload images
                </Typography>
              )}
            </label>
            {errors.images && (
              <FormHelperText error>{errors.images}</FormHelperText>
            )}
          </Box>
        </div>

        <div className={"shadow rounded-lg p-3 mt-3"}>
          <Box border={1} p={2} borderRadius={2}>
            <div className="flex flex-col items-center">
              <Typography variant="h6" align="center">
                Product Has Variant?
              </Typography>
              <Switch checked={hasVariant} onChange={handleToggle} />
            </div>

            {hasVariant && (
              <>
                <Typography
                  variant="h6"
                  align="center"
                  color="error"
                  fontWeight={400}
                  sx={{ mb: 1 }}
                >
                  Product Variant (Insert the Base Variant First)
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Size</TableCell>
                        <TableCell>Stock *</TableCell>
                        <TableCell>Price *</TableCell>
                        <TableCell>Disc. Price</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {variants.map((variant, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              select
                              fullWidth
                              value={variant.size}
                              required={hasVariant}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[index].size = e.target.value;
                                setVariants(updated);
                              }}
                              sx={{ width: "150px" }}
                            >
                              {productSizes
                                .filter((s) => s.isActive)
                                .map((size) => (
                                  <MenuItem key={size._id} value={size._id}>
                                    {size.name}
                                  </MenuItem>
                                ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              fullWidth
                              value={variant.stock}
                              required={hasVariant}
                              onChange={(e) => {
                                const updated = [...variants];
                                if (e.target.value >= 0)
                                  updated[index].stock = e.target.value;
                                setVariants(updated);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              fullWidth
                              value={variant.price}
                              required={hasVariant}
                              onChange={(e) => {
                                const updated = [...variants];
                                if (e.target.value >= 0)
                                  updated[index].price = e.target.value;
                                setVariants(updated);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              fullWidth
                              value={variant.discount}
                              onChange={(e) => {
                                const updated = [...variants];
                                if (e.target.value >= 0)
                                  updated[index].discount = e.target.value;
                                setVariants(updated);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              color="error"
                              fullWidth
                              onClick={() => handleRemoveVariant(index)}
                            >
                              <DeleteIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddVariant}
                  >
                    + Add Another Variant
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </div>

        <div className={"shadow rounded-lg p-3 mt-3"}>
          <h1>
            Product SEO Information{" "}
            <span className={"text-red-500"}>(Optional)</span>
          </h1>
          <div className={"grid grid-cols-2 gap-4"}>
            <TextField
              label="Meta Title"
              fullWidth
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              margin="normal"
            />
            <Box mb={2}>
              <Box
                display="flex"
                flexDirection="column"
                gap={1}
                margin="normal"
              >
                <TextField
                  label="Meta Keywords"
                  fullWidth
                  placeholder="Type a keyword and press Enter"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: metaKeywords.length > 0 && (
                      <InputAdornment position="start">
                        <Box gap={1}>
                          {metaKeywords.map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              onDelete={() => handleDeleteKeyword(keyword)}
                              size="small"
                              style={{
                                margin: "2px",
                                backgroundColor: "#e0e0e0",
                              }}
                            />
                          ))}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </div>
          <TextField
            label="Meta Description"
            fullWidth
            multiline
            rows={4}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            margin="none"
            InputProps={{ style: { resize: "vertical", overflow: "auto" } }}
          />
        </div>

        <div className={"flex justify-center items-center m-8"}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            className="mt-4"
          >
            {isEditMode ? "Update Product" : "Add Product"}
          </Button>
        </div>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </form>
    </div>
  );
};

export default ProductForm;
