

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
    id: "hostel_essentials",
    name: "Hostel Essentials",
    icon: "bed",
    priorityScore: 8,
    tags: ["hostel", "comfort", "sleep"],
    subcategories: [
      "Bed Sheets",
      "Pillows",
      "Blankets",
      "Mosquito Nets",
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
    id: "campus_fashion",
    name: "Campus Fashion",
    icon: "tshirt",
    priorityScore: 9,
    tags: ["clothes", "wears", "accessories"],
    subcategories: [
      "Casual Outfits",
      "Formal Wear",
      "UNIBEN Merch",
      "Scarves & Wraps",
      "Hostel Tees",
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
    id: "campus_services",
    name: "Campus Services",
    icon: "briefcase",
    priorityScore: 9,
    tags: ["services", "student help", "on-campus"],
    subcategories: [
      "Laundry Services",
      "Notes Typing",
      "Bike Repairs",
      "Phone Repairs",
      "Tutoring Sessions",
      "Room Rentals",
      "Food Delivery",
      "Printing Services",
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
    id: "campus_events",
    name: "Campus Events",
    icon: "calendar",
    priorityScore: 7,
    tags: ["activities", "social", "fun"],
    subcategories: [
      "Pop-up Sales",
      "Club Events",
      "Food Stalls",
      "Student Deals",
      "Workshops",
      "Job Fairs",
      "Competitions",
      "Charity Drives",
      "Parties",
      "Room Listings",
    ],
  },
];

export interface Chat {
  id: string;
  sellerId: string;
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastSeen: string;
  messages: { id: number; sender: string; text: string; time: string; }[];
}

export const chats: Chat[] = [
  {
    id: "1",
    sellerId: "2",
    userId: "1",
    name: "Amaka Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Omo I can’t believe that lecture today 😭",
    lastSeen: "2m ago",
    messages: [
      { id: 1, sender: "Amaka", text: "Hey, you dey?", time: "10:02 AM" },
      { id: 2, sender: "You", text: "Yea, wassup?", time: "10:03 AM" },
      { id: 3, sender: "Amaka", text: "Omo that test wicked 😭", time: "10:04 AM" },
      { id: 4, sender: "You", text: "Fr bro 💀 I wasn’t ready", time: "10:06 AM" },
      { id: 5, sender: "Amaka", text: "You wan meet later for lab?", time: "10:08 AM" },
      { id: 6, sender: "You", text: "Sure thing", time: "10:09 AM" },
      { id: 7, sender: "Amaka", text: "Cool 😎", time: "10:09 AM" },
      { id: 8, sender: "You", text: "See you there", time: "10:10 AM" },
      { id: 9, sender: "Amaka", text: "Bet", time: "10:10 AM" },
      { id: 10, sender: "You", text: "👋", time: "10:11 AM" },
    ],
  },
  {
    id: "2",
    sellerId: "1",
    userId: "2",
    name: "Tunde Okafor",
    avatar: "https://randomuser.me/api/portraits/men/31.jpg",
    lastMessage: "Send me that note abeg 😭",
    lastSeen: "5m ago",
    messages: [
      { id: 1, sender: "Tunde", text: "Guy how far", time: "9:45 AM" },
      { id: 2, sender: "You", text: "Cool bro, you?", time: "9:46 AM" },
      { id: 3, sender: "Tunde", text: "Man I missed class again 💀", time: "9:47 AM" },
      { id: 4, sender: "You", text: "😂 again??", time: "9:48 AM" },
      { id: 5, sender: "Tunde", text: "No fuel jare 😭", time: "9:50 AM" },
      { id: 6, sender: "You", text: "I’ll send you the notes", time: "9:51 AM" },
      { id: 7, sender: "Tunde", text: "Bless you 🙏", time: "9:52 AM" },
      { id: 8, sender: "You", text: "Sent ✅", time: "9:55 AM" },
      { id: 9, sender: "Tunde", text: "Got it, thanks!", time: "9:56 AM" },
      { id: 10, sender: "You", text: "No wahala 😎", time: "9:57 AM" },
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
    email: "richard.enegbuma@eng.uniben.edu",
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
    email: "lawson.osone@eng.uniben.com",
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
    name: "Mouka Foam Mattress (Student Size)",
    price: 25000,
    description: "A comfortable and durable mattress, perfect for hostel rooms.",
    image: "https://source.unsplash.com/random/?mattress",
    category: "hostel_essentials",
    subcategory: "Bed Frames",
    sellerId: "1",
  },
  {
    id: "6",
    name: "Rechargeable Fan",
    price: 12000,
    description: "A portable and rechargeable fan to keep you cool during power outages.",
    image: "https://source.unsplash.com/random/?fan",
    category: "hostel_essentials",
    subcategory: "Fans",
    sellerId: "2",
  },
  // Campus Fashion
  {
    id: "7",
    name: "UNIBEN Hoodie",
    price: 10000,
    description: "A stylish hoodie to show your school pride.",
    image: "https://source.unsplash.com/random/?hoodie",
    category: "campus_fashion",
    subcategory: "UNIBEN Merch",
    sellerId: "1",
  },
  {
    id: "8",
    name: "Nike Slides",
    price: 15000,
    description: "Comfortable and trendy slides for casual wear.",
    image: "https://source.unsplash.com/random/?slides",
    category: "campus_fashion",
    subcategory: "Sneakers",
    sellerId: "2",
  },
  // Study Supplies
  {
    id: "9",
    name: "Engineering Drawing Board",
    price: 7000,
    description: "A1 size drawing board for engineering students.",
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



