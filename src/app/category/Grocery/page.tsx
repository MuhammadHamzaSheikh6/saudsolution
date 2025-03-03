"use client"
import React, { useEffect, useState } from "react";
import { IoMdShare } from "react-icons/io";
import { MdCompareArrows, MdKeyboardArrowRight } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import Head from "next/head";
import toast, { Toaster } from "react-hot-toast";
import { useWishlist } from "@/app/context/WishlistContext";
import { FaTruck } from "react-icons/fa";

interface IProduct {
  _id: string;
  title: string;
  shortDescription: string;
  price: string;
  oldPrice?: string;
  dicountPercentage?: string;
  isNew?: boolean;
  productImage: string;
  freeDelivery?: boolean;
  tags?: string[]; // Ensure tags is an array of strings
}

export default function BeautyPage() {
  const [data, setData] = useState<IProduct[]>([]);
  const [filteredData, setFilteredData] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [isNew, setIsNew] = useState<boolean | null>(null);
  const [discounted, setDiscounted] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);
  const [show] = useState<number>(10);
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // New state for selected tag

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { addToWishlist } = useWishlist();

  const handleWishlist = (product: IProduct) => {
    if (!product) {
      toast.error("Invalid product data.");
      return;
    }

    try {
      addToWishlist(product);
      toast.success("Product added to wishlist!");
    } catch (err) {
      console.error("Error handling wishlist:", err);
      toast.error("Failed to add product to wishlist.");
    }
  };

  const handleShare = (productId: string) => {
    const productLink = `${window.location.origin}/product/${productId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Check out this product!",
          text: "I found this amazing product and thought you might like it.",
          url: productLink,
        })
        .then(() => {
          toast.success("Product shared successfully!");
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          toast.error("Failed to share product.");
        });
    } else {
      navigator.clipboard
        .writeText(productLink)
        .then(() => {
          toast.success("Link copied to clipboard!");
        })
        .catch((error) => {
          console.error("Error copying to clipboard:", error);
          toast.error("Failed to copy link.");
        });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products: IProduct[] = await client.fetch(
          '*[_type == "product" && "grocery" in category]{_id, title, shortDescription, dicountPercentage, price, oldPrice, isNew, productImage, freeDelivery, tags}'
        );
        setData(products);
        setFilteredData(products); // Initialize filtered data
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError("Failed to load products. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter Logic
  useEffect(() => {
    let filtered = [...data];

    if (isNew !== null) {
      filtered = filtered.filter((item) => item.isNew === isNew);
    }

    if (discounted) {
      filtered = filtered.filter((item) => item.dicountPercentage);
    }

    if (priceRange) {
      filtered = filtered.filter(
        (item) =>
          parseInt(item.price) >= priceRange[0] &&
          parseInt(item.price) <= priceRange[1]
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply selected tag filter
    if (selectedTag) {
      filtered = filtered.filter((item) => item.tags?.includes(selectedTag));
    }

    if (sortBy === "price-asc") {
      filtered = filtered.sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
    } else if (sortBy === "price-desc") {
      filtered = filtered.sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [isNew, discounted, priceRange, sortBy, searchQuery, data, selectedTag]);

  // Get unique tags for filter display
  const uniqueTags = [...new Set(data.flatMap((item) => item.tags || []))];

  // Pagination Logic
  const indexOfLastProduct = currentPage * show;
  const indexOfFirstProduct = indexOfLastProduct - show;
  const currentProducts = filteredData.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredData.length / show);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="text-center">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center">Error: {error}</div>;
  }

  return (
    <>
      <Toaster />

      <Head>
        <title>Grocery product - Saud Solution</title>
        <meta
          name="description"
          content="Discover our exclusive collection of Grocery products."
        />
        <meta
          name="keywords"
          content="Grocery products"
        />
        <meta name="author" content="Saud Solution" />
      </Head>

      <div>
        {/* Hero Section */}
        <div className="relative w-full h-[50vh]">
          <Image
            src="/category/grocery.png"
            alt="grocery Banner"
            layout="fill"
            style={{ objectFit: "cover", filter: "blur(3px)", opacity: 0.7 }}
            objectFit="cover"
            loading="lazy"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-gray-950">
            <Link href="/" aria-label="Go to Home">
              <Image
                src="/logo.png"
                alt="Saud Solution Logo"
                width={32}
                height={20}
                className="w-12 h-9"
                loading="lazy"
              />
            </Link>
            <h4 className="text-4xl font-bold">Grocery</h4>
            <h5 className="flex items-center text-sm md:text-xl mb-4 space-x-1">
              <Link className="font-bold text-xl" href="/" aria-label="Home">
                Home
              </Link>
              <MdKeyboardArrowRight
                className="mt-2 text-2xl"
                aria-hidden="true"
              />
              <span>Grocery</span>
            </h5>
          </div>
        </div>

        {/* Filter Section */}
        <div className="py-6 px-8 lg:px-16 bg-white shadow-md rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Filter & Sort</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Products Filter */}
            <div>
              <label
                htmlFor="isNew"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                New Products:
              </label>
              <select
                id="isNew"
                value={isNew === null ? "all" : isNew ? "true" : "false"}
                onChange={(e) => {
                  const value = e.target.value;
                  setIsNew(value === "all" ? null : value === "true");
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            {/* Discounted Filter */}
            <div>
              <label
                htmlFor="discounted"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Discounted:
              </label>
              <label className="inline-flex items-center mt-3">
                <input
                  type="checkbox"
                  id="discounted"
                  checked={discounted}
                  onChange={(e) => setDiscounted(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-yellow-500"
                />
                <span className="ml-2 text-gray-900">
                  Show only discounted products
                </span>
              </label>
            </div>

            {/* Price Range Filter */}
            <div>
              <label
                htmlFor="priceRange"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Price Range:
              </label>
              <input
                type="range"
                id="priceRange"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-sm text-gray-600 mt-1">
                Up to: Rs.{priceRange[1]}
              </div>
            </div>

            {/* Sort By Filter */}
            <div>
              <label
                htmlFor="sortBy"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Sort By:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="default">Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Tag Filter using Select Dropdown */}
            <div>
              <label
                htmlFor="tagSelect"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Tags:
              </label>
              <select
                id="tagSelect"
                value={selectedTag || ""} // Use empty string as value for "All"
                onChange={(e) => setSelectedTag(e.target.value === "" ? null : e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">All</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Filter */}
            <div>
              <label
                htmlFor="search"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Search:
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="py-12 px-8 lg:px-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {currentProducts.map((item) => (
              <div
                key={item._id}
                className="relative bg-gray-100 rounded overflow-hidden group"
                role="listitem"
                aria-label={`Product: ${item.title}`}
              >
                <Image
                  src={urlFor(item.productImage).width(1000).height(1000).url()}
                  alt={`Image of ${item.title}`}
                  width={1000}
                  height={1000}
                  loading="lazy"
                  priority={false}
                />

                {item.dicountPercentage && (
                  <span
                    className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center"
                    style={{
                      width: "33px",
                      height: "33px",
                      borderRadius: "50%",
                    }}
                    aria-label={`Discount: ${item.dicountPercentage}%`}
                  >
                    {item.dicountPercentage}%
                  </span>
                )}

                {item.isNew && (
                  <span
                    className="absolute top-4 right-4 bg-[#2EC1AC] text-white text-xs font-bold py-2 px-4 rounded-full flex items-center justify-center"
                    style={{
                      width: "33px",
                      height: "33px",
                      textAlign: "center",
                      lineHeight: "40px",
                    }}
                  >
                    NEW
                  </span>
                )}

                {item.freeDelivery && (
                  <div className="absolute top-4 left-4 bg-indigo-500 text-white text-xs font-bold py-1 px-2 rounded-md flex items-center space-x-1">
                    <FaTruck />
                    <span>Free Delivery</span>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-lg line-clamp-2" title={item.title}>
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-1" title={item.shortDescription}>
                    {item.shortDescription}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="font-bold">Rs. {item.price}</span>
                    {item.oldPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        Rs. {item.oldPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/product/${item._id}`} legacyBehavior>
                    <a
                      className="bg-white hover:bg-yellow-500 text-yellow-600 hover:text-white px-6 py-2 mb-2 font-medium rounded shadow"
                      aria-label={`View details of ${item.title}`}
                    >
                      View Details
                    </a>
                  </Link>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShare(item._id)}
                      className="flex items-center gap-1 hover:text-red-500 text-white"
                      aria-label={`Share ${item.title}`}
                    >
                      <IoMdShare />
                      <span>Share</span>
                    </button>
                    <Link href={`/comparison/${item._id}`} legacyBehavior>
                      <a
                        className="flex items-center gap-1 hover:text-red-500 text-white"
                        aria-label={`Compare ${item.title}`}
                      >
                        <MdCompareArrows />
                        <span>Compare</span>
                      </a>
                    </Link>
                    <button
                      onClick={() => handleWishlist(item)}
                      className="flex items-center gap-1 text-white hover:text-red-500"
                      aria-label={`Add ${item.title} to wishlist`}
                    >
                      <FaRegHeart />
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`mx-1 px-4 py-2 rounded ${
                  currentPage === page
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-yellow-300"
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}