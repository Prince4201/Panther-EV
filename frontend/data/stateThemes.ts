export interface StateTheme {
  id: string;
  name: string;
  tagline: string;
  landmark: string;
  icon: string;
  bgImage: string;
  aliases: string[];
}

export const DEFAULT_THEME: StateTheme = {
  id: 'national',
  name: 'Pan-India',
  tagline: 'Built for every journey across India',
  landmark: 'National Highway Network',
  icon: '⚡',
  bgImage: '/hero/golden-sunset-road.jpg',
  aliases: ['india', 'national', 'all'],
};

export const INDIAN_STATES: StateTheme[] = [
  {
    id: 'uttar-pradesh',
    name: 'Uttar Pradesh',
    tagline: 'Land of Divine Heritage & Grand Temples',
    landmark: 'Ayodhya & Varanasi Temple Corridor',
    icon: '🛕',
    bgImage: '/hero/states/uttar-pradesh.jpg',
    aliases: ['up', 'uttar pradesh', 'lucknow', 'varanasi', 'ayodhya', 'meerut', 'kanpur', 'noida', 'ghaziabad', 'agra', 'prayagraj', 'mathura'],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    tagline: 'Financial Capital & Modern High-Rise Expressway',
    landmark: 'Mumbai Bandra-Worli Sea Link & Skyline',
    icon: '🏢',
    bgImage: '/hero/states/maharashtra.jpg',
    aliases: ['mh', 'maharashtra', 'mumbai', 'pune', 'nagpur', 'thane', 'nashik', 'aurangabad', 'navi mumbai'],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    tagline: 'The Heart of the Nation & Grand Avenues',
    landmark: 'India Gate & Central Vista Boulevard',
    icon: '🏛️',
    bgImage: '/hero/states/delhi.jpg',
    aliases: ['dl', 'delhi', 'new delhi', 'ncr', 'central delhi', 'south delhi'],
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    tagline: 'Land of Royal Forts & Golden Desert Highways',
    landmark: 'Amer Palace & Desert Sunset Highway',
    icon: '🏰',
    bgImage: '/hero/states/rajasthan.jpg',
    aliases: ['rj', 'rajasthan', 'jaipur', 'jodhpur', 'udaipur', 'kota', 'bikaner', 'ajmer'],
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    tagline: 'Growth Engine of Green Energy & Coastal Expressways',
    landmark: 'Statue of Unity & Coastal Solar Corridor',
    icon: '⚡',
    bgImage: '/hero/states/gujarat.jpg',
    aliases: ['gj', 'gujarat', 'ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar', 'gandhinagar'],
  },
  {
    id: 'punjab',
    name: 'Punjab',
    tagline: 'The Breadbasket & Golden Fields Expressway',
    landmark: 'Golden Temple & Rich Agrarian Highways',
    icon: '🌾',
    bgImage: '/hero/states/punjab.jpg',
    aliases: ['pb', 'punjab', 'amritsar', 'ludhiana', 'jalandhar', 'patiala', 'bathinda'],
  },
  {
    id: 'haryana',
    name: 'Haryana',
    tagline: 'Dynamic Industrial Hub & High-Speed Corridors',
    landmark: 'Gurugram Cyber Hub & Modern Expressways',
    icon: '🚗',
    bgImage: '/hero/states/haryana.jpg',
    aliases: ['hr', 'haryana', 'gurgaon', 'gurugram', 'faridabad', 'panipat', 'ambala', 'karnal', 'rohtak'],
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    tagline: 'Silicon Valley & Majestic Heritage Highways',
    landmark: 'Bengaluru Tech Corridor & Mysuru Palace',
    icon: '💻',
    bgImage: '/hero/states/karnataka.jpg',
    aliases: ['ka', 'karnataka', 'bangalore', 'bengaluru', 'mysore', 'mysuru', 'hubli', 'mangalore'],
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    tagline: 'Cradle of Dravidian Architecture & Industrial Might',
    landmark: 'Brihadisvara Temple & Coastal Corridors',
    icon: '🛕',
    bgImage: '/hero/states/tamil-nadu.jpg',
    aliases: ['tn', 'tamil nadu', 'chennai', 'coimbatore', 'madurai', 'trichy', 'salem'],
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    tagline: 'Cultural Capital & Iconic Riverways',
    landmark: 'Howrah Bridge & Hooghly Riverfront',
    icon: '🌉',
    bgImage: '/hero/states/west-bengal.jpg',
    aliases: ['wb', 'west bengal', 'bengal', 'kolkata', 'howrah', 'durgapur', 'asansol', 'siliguri'],
  },
  {
    id: 'kerala',
    name: 'Kerala',
    tagline: 'God’s Own Country & Palm-Fringed Coastal Highways',
    landmark: 'Backwaters & Coastal Coconut Corridors',
    icon: '🌴',
    bgImage: '/hero/states/kerala.jpg',
    aliases: ['kl', 'kerala', 'kochi', 'cochin', 'thiruvananthapuram', 'trivandrum', 'kozhikode', 'calicut'],
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh',
    tagline: 'The Heart of Incredible India & Forest Highways',
    landmark: 'Khajuraho & Gwalior Fort Roadways',
    icon: '🐅',
    bgImage: '/hero/states/madhya-pradesh.jpg',
    aliases: ['mp', 'madhya pradesh', 'bhopal', 'indore', 'gwalior', 'jabalpur', 'ujjain'],
  },
  {
    id: 'bihar',
    name: 'Bihar',
    tagline: 'Cradle of Ancient Wisdom & Historic Highways',
    landmark: 'Mahabodhi Temple & Nalanda Heritage',
    icon: '🕉️',
    bgImage: '/hero/states/bihar.jpg',
    aliases: ['br', 'bihar', 'patna', 'gaya', 'muzaffarpur', 'bhagalpur'],
  },
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh',
    tagline: 'Sunrise State of Coastal Highways & Sacred Hills',
    landmark: 'Tirumala Hills & Visakhapatnam Coastal Road',
    icon: '🌅',
    bgImage: '/hero/states/andhra-pradesh.jpg',
    aliases: ['ap', 'andhra pradesh', 'visakhapatnam', 'vizag', 'vijayawada', 'guntur', 'tirupati'],
  },
  {
    id: 'telangana',
    name: 'Telangana',
    tagline: 'Historic Charminar & Futuristic Cyber Corridors',
    landmark: 'Charminar & HITEC City Outer Ring Road',
    icon: '🌟',
    bgImage: '/hero/states/telangana.jpg',
    aliases: ['ts', 'telangana', 'hyderabad', 'secunderabad', 'warangal', 'nizamabad'],
  },
  {
    id: 'odisha',
    name: 'Odisha',
    tagline: 'Soul of India & Sun Temple Coastal Highway',
    landmark: 'Konark Sun Temple & Puri Marine Drive',
    icon: '☀️',
    bgImage: '/hero/states/odisha.jpg',
    aliases: ['od', 'odisha', 'orissa', 'bhubaneswar', 'cuttack', 'puri', 'rourkela'],
  },
  {
    id: 'assam',
    name: 'Assam',
    tagline: 'Land of Lush Tea Gardens & Brahmaputra Expressways',
    landmark: 'Kaziranga & Rolling Emerald Tea Estates',
    icon: '🍃',
    bgImage: '/hero/states/assam.jpg',
    aliases: ['as', 'assam', 'guwahati', 'silchar', 'dibrugarh', 'jorhat'],
  },
  {
    id: 'himachal-pradesh',
    name: 'Himachal Pradesh',
    tagline: 'Dev Bhoomi & Majestic Himalayan Mountain Roads',
    landmark: 'Snow-Capped Himalayan Mountain Passes',
    icon: '🏔️',
    bgImage: '/hero/states/himachal-pradesh.jpg',
    aliases: ['hp', 'himachal pradesh', 'himachal', 'shimla', 'manali', 'dharamshala', 'kullu'],
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    tagline: 'Land of Gods & Scenic Sacred River Corridors',
    landmark: 'Rishikesh Foothills & Garhwal Valleys',
    icon: '🏞️',
    bgImage: '/hero/states/uttarakhand.jpg',
    aliases: ['uk', 'uttarakhand', 'uttaranchal', 'dehradun', 'haridwar', 'rishikesh', 'nainital'],
  },
  {
    id: 'jammu-kashmir',
    name: 'Jammu & Kashmir',
    tagline: 'Paradise on Earth & Valley Roads',
    landmark: 'Dal Lake & Pine-Fringed Valley Highways',
    icon: '❄️',
    bgImage: '/hero/states/jammu-kashmir.jpg',
    aliases: ['jk', 'jammu and kashmir', 'jammu', 'kashmir', 'srinagar'],
  },
  {
    id: 'goa',
    name: 'Goa',
    tagline: 'Sun-Drenched Coastal Roads & Portuguese Architecture',
    landmark: 'Goan Palm-Lined Coastal Avenue',
    icon: '🏖️',
    bgImage: '/hero/states/goa.jpg',
    aliases: ['ga', 'goa', 'panaji', 'margao', 'vasco'],
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand',
    tagline: 'Land of Forests & Mineral Rich Industrial Roads',
    landmark: 'Chota Nagpur Plateau & Parasnath Hills',
    icon: '🌲',
    bgImage: '/hero/states/jharkhand.jpg',
    aliases: ['jh', 'jharkhand', 'ranchi', 'jamshedpur', 'dhanbad', 'bokaro'],
  },
  {
    id: 'chhattisgarh',
    name: 'Chhattisgarh',
    tagline: 'Rice Bowl of India & Lush Sal Forest Corridors',
    landmark: 'Chitrakote Falls & Green Highway Corridors',
    icon: '🌿',
    bgImage: '/hero/states/chhattisgarh.jpg',
    aliases: ['cg', 'chhattisgarh', 'raipur', 'bilaspur', 'durg', 'bhilai'],
  },
  {
    id: 'arunachal-pradesh',
    name: 'Arunachal Pradesh',
    tagline: 'Land of Dawn-Lit Mountains & Eastern Himalayan Passes',
    landmark: 'Tawang Monastery & Mountain Ridges',
    icon: '🌄',
    bgImage: '/hero/states/arunachal-pradesh.jpg',
    aliases: ['ar', 'arunachal pradesh', 'itangar', 'tawang'],
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    tagline: 'Abode of Clouds & Living Root Bridges',
    landmark: 'Shillong Pine Hills & Cloud Highway',
    icon: '☁️',
    bgImage: '/hero/states/meghalaya.jpg',
    aliases: ['ml', 'meghalaya', 'shillong', 'cherrapunji', 'tura'],
  },
  {
    id: 'manipur',
    name: 'Manipur',
    tagline: 'Jewel of India & Pristine Lake Roads',
    landmark: 'Loktak Lake & Valley Mountain Roads',
    icon: '💎',
    bgImage: '/hero/states/manipur.jpg',
    aliases: ['mn', 'manipur', 'imphal'],
  },
  {
    id: 'mizoram',
    name: 'Mizoram',
    tagline: 'Land of Rolling Blue Hills & Serene Passes',
    landmark: 'Aizawl Mountain Ridge Highway',
    icon: '⛰️',
    bgImage: '/hero/states/mizoram.jpg',
    aliases: ['mz', 'mizoram', 'aizawl'],
  },
  {
    id: 'nagaland',
    name: 'Nagaland',
    tagline: 'Land of Festivals & Scenic Naga Hills',
    landmark: 'Kohima Scenic Mountain Ridge Pass',
    icon: '🎯',
    bgImage: '/hero/states/nagaland.jpg',
    aliases: ['nl', 'nagaland', 'kohima', 'dimapur'],
  },
  {
    id: 'tripura',
    name: 'Tripura',
    tagline: 'Royal Palaces & Bamboo Grove Expressways',
    landmark: 'Ujjayanta Palace & Agartala Avenues',
    icon: '🛕',
    bgImage: '/hero/states/tripura.jpg',
    aliases: ['tr', 'tripura', 'agartala'],
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    tagline: 'Organic Kingdom in the Lap of Kanchenjunga',
    landmark: 'Mount Kanchenjunga & Teesta Valley Highway',
    icon: '🏔️',
    bgImage: '/hero/states/sikkim.jpg',
    aliases: ['sk', 'sikkim', 'gangtok'],
  },
];

/**
 * Normalizes user input (state string, city, address line) and returns the corresponding StateTheme.
 * If unmatched, returns DEFAULT_THEME.
 */
export function getStateTheme(input?: string | null): StateTheme {
  if (!input || typeof input !== 'string') return DEFAULT_THEME;
  const clean = input.toLowerCase().trim();

  // 1. Direct match on id or name
  for (const st of INDIAN_STATES) {
    if (st.id === clean || st.name.toLowerCase() === clean) return st;
  }

  // 2. Keyword/alias substring match
  for (const st of INDIAN_STATES) {
    for (const alias of st.aliases) {
      if (clean === alias || clean.includes(alias)) {
        return st;
      }
    }
  }

  return DEFAULT_THEME;
}
