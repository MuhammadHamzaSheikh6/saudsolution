"use client";
import { useLocalStorage } from "@/app/context/CartContext";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaMinus,
  FaPlus,
  FaTwitter,
} from "react-icons/fa6";
import { MdOutlineStar } from "react-icons/md";
import { useRouter } from "next/navigation"; // Import useRouter
import { useUser } from "@clerk/nextjs"; // Import useUser from
import Notification from "../Notification"; // Import the Notification component

export interface IProduct {
  title: string;
  price: string;
  description?: string;
  tags?: string[];
  SKU?: string;
  category?: string;
  rating?: number;
  customerReview?: number;
  productImage?: string;
  productImage1?: string;
  productImage2?: string;
  productImage3?: string;
  availableSizes?: string[];
  availableColors?: string[];
  defaultSize?: string;
  defaultColor?: string;
}

export default function Detail({ id }: { id: string }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useLocalStorage<IProduct[]>("cart", []);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const router = useRouter(); // Initialize useRouter
  const { isSignedIn, isLoaded } = useUser(); // Use the useUser hook from

  // Fetch product data
  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const query = `*[_type == "product" && _id == $id][0]{
          title,
          price,
          description,
          tags,
          SKU,
          category,
          rating,
          customerReview,
          productImage,
          productImage1,
          productImage2,
          productImage3,
          availableSizes,
          availableColors,
          defaultSize,
          defaultColor
        }`;
        const data: IProduct = await client.fetch(query, { id });

        if (!data) {
          setError("Product not found.");
          setLoading(false);
          return;
        }

        setProduct(data);
        if (data.productImage) {
          setSelectedImage(urlFor(data.productImage).url());
        }
        if (data.defaultSize) {
          setSelectedSize(data.defaultSize);
        }
        if (data.defaultColor) {
          setSelectedColor(data.defaultColor);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to fetch product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity(quantity + 1);
    } else if (type === "decrease" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Handle share functionality
  const handleShare = (platform: "facebook" | "twitter" | "instagram") => {
    if (!product) return;
    const productUrl = window.location.href;
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=Check out this product!`;
        break;
      case "instagram":
        url = `https://www.instagram.com/?url=${encodeURIComponent(productUrl)}`;
        break;
    }
    window.open(url, "_blank");
  };

  // State for the notification
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Handle add to cart
  const handleCart = () => {
    if (!product) return;

    if (!isLoaded) {
      // Clerk is still loading, you might want to show a loading indicator
      console.log("Clerk is still loading...");
      return;
    }

    if (!isSignedIn) {
      // Redirect to sign-in page with returnBackUrl
      const returnBackUrl = window.location.href;
      router.push(
        `/sign-in?returnBackUrl=${encodeURIComponent(returnBackUrl)}`
      );
      return;
    }

    const updatedCart = [
      ...cart,
      {
        ...product,
        quantity,
        selectedColor,
        selectedSize,
      },
    ];

    setCart(updatedCart);
    // Show the notification
    setNotification({ message: "Product added to cart!", type: "success" });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const ImageModal = ({
    src,
    onClose,
  }: {
    src: string;
    onClose: () => void;
  }) => {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
        <Image
          src={src}
          alt="Full Screen"
          height={1000}
          width={1000}
          style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }}
        />
      </div>
    );
  };

  // Loading and error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!product) return <p>Product not found.</p>;

  // Destructure product data
  const {
    title,
    price,
    description,
    tags,
    SKU,
    category,
    rating,
    customerReview,
    productImage,
    productImage1,
    productImage2,
    productImage3,
    availableSizes,
    availableColors,
  } = product;

  // Prepare thumbnail images
  const thumbnailImages = [
    productImage,
    productImage1,
    productImage2,
    productImage3,
  ]
    .filter((img) => img)
    .map((img) => urlFor(img!).url());

  return (
    <div className="max-w-7xl mx-auto grid md:mx-8 grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Render the notification component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {/* Left Section */}
      <div className="lg:col-span-6 lg:flex gap-3 md:gap-7 space-y-6">
        <div className="lg:space-y-10 md:space-x-0 space-x-5 flex justify-center lg:block mt-6">
          {thumbnailImages.map((src, index) => (
            <div
              key={index}
              className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(src)}
            >
              <Image
                src={src}
                alt={`Thumbnail ${index + 1}`}
                width={1000}
                height={1000}
                className="md:w-full md:h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
          {selectedImage && (
            <div onClick={() => setIsModalOpen(true)}>
              <Image
                src={selectedImage}
                alt="Product Image"
                width={1000}
                height={1000}
                className="h-[240px] lg:h-[500px] lg:w-[423px] object-cover cursor-pointer"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:col-span-6 mx-3 md:mx-0 mt-8 space-y-6">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
          {title}
        </h1>
        <p className="text-xl text-gray-400 font-semibold">Rs. {price}</p>
        <p className="text-gray-600 md:mr-48">{description}</p>

        {/* Rating and Customer Reviews */}
        <div className="flex items-center">
          <div className="flex">
            {Array.from({ length: rating || 0 }).map((_, i) => (
              <span key={i}>
                <MdOutlineStar className="text-yellow-400 text-[25px]" />
              </span>
            ))}
            {Array.from({ length: 5 - (rating || 0) }).map((_, i) => (
              <span key={i}>
                <MdOutlineStar className="text-yellow-100 text-[25px]" />
              </span>
            ))}
          </div>
          <span className="border-l-2 b h-6 mx-5"></span>
          <p className="text-gray-500">{customerReview} Customer Reviews</p>
        </div>

        {/* Size and Color Selectors */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">Size</h3>
            <div className="flex space-x-4 mt-2">
              {availableSizes?.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-md ${
                    selectedSize === size
                      ? "border-[#B88E2F] bg-[#B88E2F] text-white"
                      : "bg-[#F9F1E7] text-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-800">Color</h3>
            <div className="flex space-x-4 mt-2">
              {availableColors?.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-8 h-8 rounded-full border ${
                    selectedColor === color
                      ? "ring-2 ring-[#b9935a]"
                      : "border-gray-300"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Quantity Selector and Add to Cart */}
        <div className="md:flex items-center space-y-5 md:space-y-0 space-x-4">
          <div className="w-[120px] flex items-center border rounded-md overflow-hidden">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="px-3 py-2 text-gray-600"
            >
              <FaMinus />
            </button>
            <span className="px-4 py-2 text-gray-800">{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="px-3 py-2 text-gray-600"
            >
              <FaPlus />
            </button>
          </div>

          <button
            className="flex place-items-center border-2 text-gray-700 px-10 py-3 rounded-md font-medium hover:border-black transition"
            onClick={handleCart}
          >
            Add to Cart
          </button>

          <button className="flex place-items-center border-2 text-gray-700 px-10 py-3 rounded-md font-medium hover:border-black transition">
            <FaPlus className="mx-2" />
            <a href={`/comparison/${id}`}>Compare</a>
          </button>
        </div>

        {/* Product Details */}
        <div className="md:mr-[350px] md:grid md:grid-cols-2 gap-y-3 text-gray-400 text-sm items-center">
          <p className="font-medium">SKU:</p>
          <p>{SKU}</p>
          <p className="font-medium">Category:</p>
          <p>{category}</p>
          <p className="font-medium">Tags:</p>
          <p>{tags?.join(", ")}</p>
          <div className="flex gap-7">
            <p className="font-medium">Share:</p>
            <div className="flex ml-11 space-x-3">
              <FaFacebook
                className="text-gray-950 hover:text-[#3b5998] cursor-pointer text-xl"
                onClick={() => handleShare("facebook")}
              />
              <FaTwitter
                className="text-gray-950 hover:text-[#1DA1F2] cursor-pointer text-xl"
                onClick={() => handleShare("twitter")}
              />
              <FaInstagram
                className="text-gray-950 hover:text-[#E4405F] cursor-pointer text-xl"
                onClick={() => handleShare("instagram")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Full Screen Image */}
      {isModalOpen && selectedImage && (
        <ImageModal src={selectedImage} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
