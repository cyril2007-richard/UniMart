

export interface Category {
  id: string;
  name: string;
  icon: string;
  priorityScore: number;
  tags: string[];
  subcategories: string[];
}


const mockData: Category[] = [
  {
    id: "groceries",
    name: "Groceries",
    icon: "shopping-basket",
    priorityScore: 10,
    tags: ["food", "essentials", "daily needs"],
    subcategories: [
      "Rice & Grains",
      "Pasta & Noodles",
      "Cooking Oils",
      "Drinks & Juices",
      "Instant Meals",
      "Milk & Dairy",
      "Spices & Seasonings",
      "Bottled Water",
      "Canned Foods",
      "Baking Supplies",
    ],
  },
  {
    id: "snacks",
    name: "Snacks",
    icon: "cookie",
    priorityScore: 9,
    tags: ["munchies", "sweet", "quick bite"],
    subcategories: [
      "Biscuits & Cookies",
      "Energy Drinks",
      "Coffee & Tea",
      "Cereals",
      
      "Ready-to-Eat Meals",
      "Chocolates & Sweets",
      "Nuts & Seeds",
      "Chips & Crackers",
      "Granola & Bars",
    ],
  },
  {
    id: "tech_gadgets",
    name: "Tech & Gadgets",
    icon: "smartphone",
    priorityScore: 9,
    tags: ["electronics", "devices", "gadgets"],
    subcategories: [
      "Phones",
      "Chargers",
      "Power Banks",
      "Earphones & Headsets",
      "USB Drives",
      "Phone Cases",
      "Cables & Adapters",
      "Screen Protectors",
      "Laptop Accessories",
      "Bluetooth Devices",
    ],
  },
  {
    id: "home_essentials",
    name: "Home Essentials",
    icon: "bed",
    priorityScore: 8,
    tags: ["home", "comfort", "sleep"],
    subcategories: [
      "Bed Sheets",
      "Pillows",
      "Blankets",
      "Protective Covers",
      "Fans",
      "Mattress Covers",
      "Curtains",
      "Storage Solutions",
      "Bed Frames",
      "Laundry Baskets",
    ],
  },
  {
    id: "kitchen_gear",
    name: "Kitchen Gear",
    icon: "utensils",
    priorityScore: 8,
    tags: ["cooking", "appliances", "kitchen tools"],
    subcategories: [
      "Pots & Pans",
      "Cutlery",
      "Kettles",
      "Hotplates",
      "Air Fryers",
      "Microwaves",
      "Cooking Tools",
      "Plates & Bowls",
      "Blenders",
      "Food Containers",
    ],
  },
  {
    id: "local_fashion",
    name: "Local Fashion",
    icon: "tshirt",
    priorityScore: 9,
    tags: ["clothes", "wears", "accessories"],
    subcategories: [
      "Casual Outfits",
      "Formal Wear",
      "Community Merch",
      "Scarves & Wraps",
      "Graphic Tees",
      "Caps & Hats",
      "Hoodies & Jackets",
      "Socks & Underwear",
      "Sneakers",
      "Accessories",
    ],
  },
  {
    id: "study_supplies",
    name: "Study Supplies",
    icon: "book",
    priorityScore: 10,
    tags: ["education", "learning", "stationery"],
    subcategories: [
      "Textbooks",
      "Lecture Notes",
      "Lab Equipment",
      "Pens & Stationery",
      "Planners",
      "Calculators",
      "Notebooks",
      "Highlighters",
      "Binders",
      "Past Questions",
    ],
  },
  {
    id: "cleaning_home",
    name: "Cleaning & Home",
    icon: "broom",
    priorityScore: 7,
    tags: ["clean", "home care", "hygiene"],
    subcategories: [
      "Laundry Detergent",
      "Brooms & Dustpans",
      "Trash Bags",
      "Disinfectants",
      "Laundry Tools",
      "Mops & Cleaners",
      "Buckets",
      "Cleaning Brushes",
      "Air Fresheners",
      "Pest Control",
    ],
  },
  {
    id: "personal_care",
    name: "Personal Care",
    icon: "heart",
    priorityScore: 8,
    tags: ["health", "beauty", "hygiene"],
    subcategories: [
      "Soaps & Shampoos",
      "First Aid Kits",
      "Sanitary Pads",
      "Painkillers & Meds",
      "Mosquito Repellent",
      "Skincare Products",
      "Hair Products",
      "Body Lotions",
      "Toothpaste",
      "Deodorants",
    ],
  },
  {
    id: "local_services",
    name: "Local Services",
    icon: "briefcase",
    priorityScore: 9,
    tags: ["services", "help", "nearby"],
    subcategories: [
      "Laundry Services",
      "Typing & Printing",
      "Bike Repairs",
      "Phone Repairs",
      "Tutoring Sessions",
      "Room Rentals",
      "Food Delivery",
      "Maintenance",
      "Haircuts",
      "Event Planning",
    ],
  },
  {
    id: "secondhand_deals",
    name: "Secondhand Deals",
    icon: "recycle",
    priorityScore: 8,
    tags: ["used", "cheap", "resell"],
    subcategories: [
      "Used Phones",
      "Used Laptops",
      "Used Furniture",
      "Used Books",
      "Used Clothes",
      "Used Appliances",
      "Used Electronics",
      "Used Accessories",
      "Used Bikes",
      "Used Gadgets",
    ],
  },
  {
    id: "local_events",
    name: "Community Events",
    icon: "calendar",
    priorityScore: 7,
    tags: ["activities", "social", "fun"],
    subcategories: [
      "Pop-up Sales",
      "Club Events",
      "Food Stalls",
      "Hot Deals",
      "Workshops",
      "Job Fairs",
      "Competitions",
      "Charity Drives",
      "Parties",
      "Room Listings",
    ],
  },
];

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  matricNumber: string;
  faculty: string;
  followers: number;
  following: number;
  rating: number;
  totalReviews: number;
  productsCount: number;
}

export const users: User[] = [
  {
    id: "1",
    name: "Enegbuma Richard Oseiwe",
    username: "Sapaman07",
    email: "richard.enegbuma@example.com",
    password: "12345678",
    profilePicture: "https://randomuser.me/api/portraits/men/31.jpg",
    matricNumber: "ENG2204557",
    faculty: "Engineering",
    followers: 120,
    following: 75,
    rating: 4.5,
    totalReviews: 23,
    productsCount: 12,
  },
  {
    id: "2",
    name: "Lawson Osone",
    username: "Gerald",
    email: "lawson.osone@example.com",
    password: "12345678",
    profilePicture: "https://randomuser.me/api/portraits/men/31.jpg",
    matricNumber: "ENG2204563",
    faculty: "Engineering",
    followers: 1209,
    following: 7,
    rating: 4.8,
    totalReviews: 124,
    productsCount: 45,
  }
];


export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export const reviews: Review[] = [
  { id: 1, name: "Sarah M.", rating: 5, comment: "Great product! Fast delivery", date: "2 days ago" },
  { id: 2, name: "Mike T.", rating: 4, comment: "Good quality for the price", date: "1 week ago" },
  { id: 3, name: "Emma K.", rating: 5, comment: "Exactly as described", date: "2 weeks ago" },
];


export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  subcategory: string;
  sellerId: string;
}

export const products: Product[] = [
  // Groceries
  {
    id: "1",
    name: "Mama Gold Rice (5kg)",
    price: 8500,
    description: "High-quality Nigerian rice, perfect for jollof and other dishes.",
    image: "https://source.unsplash.com/random/?rice",
    category: "groceries",
    subcategory: "Rice & Grains",
    sellerId: "1",
  },
  {
    id: "2",
    name: "Indomie Instant Noodles (Carton)",
    price: 4500,
    description: "A carton of delicious and easy-to-cook Indomie noodles.",
    image: "https://source.unsplash.com/random/?noodles",
    category: "groceries",
    subcategory: "Pasta & Noodles",
    sellerId: "1",
  },
  // Tech & Gadgets
  {
    id: "3",
    name: "Oraimo Power Bank (20000mAh)",
    price: 15000,
    description: "A reliable power bank to keep your devices charged on the go.",
    image: "https://source.unsplash.com/random/?powerbank",
    category: "tech_gadgets",
    subcategory: "Power Banks",
    sellerId: "2",
  },
  {
    id: "4",
    name: "itel Earbuds",
    price: 8000,
    description: "Affordable and quality earbuds for music and calls.",
    image: "https://source.unsplash.com/random/?earbuds",
    category: "tech_gadgets",
    subcategory: "Earphones & Headsets",
    sellerId: "2",
  },
  // Hostel Essentials
  {
    id: "5",
    name: "Mouka Foam Mattress (Single Size)",
    price: 25000,
    description: "A comfortable and durable mattress, perfect for any bedroom.",
    image: "https://source.unsplash.com/random/?mattress",
    category: "home_essentials",
    subcategory: "Bed Frames",
    sellerId: "1",
  },
  {
    id: "6",
    name: "Rechargeable Fan",
    price: 12000,
    description: "A portable and rechargeable fan to keep you cool during power outages.",
    image: "https://source.unsplash.com/random/?fan",
    category: "home_essentials",
    subcategory: "Fans",
    sellerId: "2",
  },
  // Local Fashion
  {
    id: "7",
    name: "Community Hoodie",
    price: 10000,
    description: "A stylish hoodie to show your community pride.",
    image: "https://source.unsplash.com/random/?hoodie",
    category: "local_fashion",
    subcategory: "Community Merch",
    sellerId: "1",
  },
  {
    id: "8",
    name: "Nike Slides",
    price: 15000,
    description: "Comfortable and trendy slides for casual wear.",
    image: "https://source.unsplash.com/random/?slides",
    category: "local_fashion",
    subcategory: "Sneakers",
    sellerId: "2",
  },
  // Study Supplies
  {
    id: "9",
    name: "Engineering Drawing Board",
    price: 7000,
    description: "A1 size drawing board for professionals and hobbyists.",
    image: "https://source.unsplash.com/random/?drawing-board",
    category: "study_supplies",
    subcategory: "Lab Equipment",
    sellerId: "1",
  },
  {
    id: "10",
    name: "GST Past Questions",
    price: 1500,
    description: "A compilation of past questions for General Studies courses.",
    image: "https://source.unsplash.com/random/?book",
    category: "study_supplies",
    subcategory: "Past Questions",
    sellerId: "2",
  },
];

export default mockData;



