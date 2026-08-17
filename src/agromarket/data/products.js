const generateProducts = () => {
  const seeds = [
    { name: 'Wheat Seeds - HD 3086', brand: 'Nirmal Seeds', price: 450, category: 'seeds', image: 'https://5.imimg.com/data5/SELLER/Default/2025/8/532792488/HL/VN/WF/14227193/dbw-187-wheat-seed-500x500.jpeg' },
    { name: 'Rice Seeds - Basmati 1121', brand: 'Krishak Seeds', price: 680, category: 'seeds', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI76Er9GCiopfBpmAPTM6c2u-5swWogRWBeA&s' },
    { name: 'Cotton Seeds - Bt Cotton', brand: 'Mahyco', price: 850, category: 'seeds', image: 'https://m.media-amazon.com/images/I/417aZBm+HIS._AC_UF1000,1000_QL80_.jpg' },
    { name: 'Soybean Seeds - JS 335', brand: 'Jain Seeds', price: 520, category: 'seeds', image: 'https://www.bombaysuperseeds.com/images/prod/soybean/1.jpg' },
    { name: 'Maize Seeds - Hybrid', brand: 'Pioneer', price: 750, category: 'seeds', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK88WTVXJITKBRFBhYnypCbtfHN1MAQVrcUQ&s' },
    { name: 'Mustard Seeds - Pusa Bold', brand: 'IARI', price: 380, category: 'seeds', image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/spice-masala/s/b/g/400-best-quality-mustard-seed-400gm-pack-of-1-sarso-sarson-pouch-original-imagjhmq3uuyn8ej.jpeg?q=90' },
    { name: 'Groundnut Seeds - TMV 2', brand: 'TNAU', price: 420, category: 'seeds', image: 'https://www.bombaysuperseeds.com/images/prod/groundnut/4.jpg' },
    { name: 'Sunflower Seeds - KBSH 44', brand: 'Kaveri Seeds', price: 550, category: 'seeds', image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ9IXIAjwnID31Q93EjOiG72ZK20XtiquYIiXXLZkmuQaG_9kBRNI5k96KCX6BJXuhWLeGj78ss9EAk7CvKOW890UVf1RqsJ_uxvtv9CKObP-OZygbOVvtz9g' },
  ]

  const fertilisers = [
    { name: 'Urea Fertilizer 50kg', brand: 'IFFCO', price: 1200, category: 'fertilisers', image: 'https://www.jiomart.com/images/product/original/rvhfhmnijf/go-garden-all-purpose-urea-n-46-percent-fertilizer-for-home-plants-gardening-1-kg-granules-product-images-orvhfhmnijf-p591276324-0-202205120346.jpg?im=Resize=(1000,1000)' },
    { name: 'DAP Fertilizer 50kg', brand: 'IFFCO', price: 2400, category: 'fertilisers', image: 'https://agriplexindia.com/cdn/shop/files/DAP-plus.png?v=1750420737' },
    { name: 'NPK 19:19:19 50kg', brand: 'Coromandel', price: 2800, category: 'fertilisers', image: 'https://krushidukan.bharatagri.com/cdn/shop/files/Katyayani_NPK_19_19_19_Fertilizer.webp?v=1751644774' },
    { name: 'Potash Fertilizer 50kg', brand: 'IFFCO', price: 1800, category: 'fertilisers', image: 'https://www.jiomart.com/images/product/original/rvn1uhnsn1/erwon-potash-fertilizer-pure-premium-powerful-fertilizer-for-overall-growth-of-plants-1800gm-product-images-orvn1uhnsn1-p607599462-0-202401291216.jpg?im=Resize=(420,420)' },
    { name: 'Single Super Phosphate 50kg', brand: 'Coromandel', price: 1500, category: 'fertilisers', image: 'https://m.media-amazon.com/images/I/71Wv+zYm0RL.jpg' },
    { name: 'Ammonium Sulphate 50kg', brand: 'RCF', price: 1600, category: 'fertilisers', image: 'https://mahadhan.co.in/wp-content/uploads/2017/05/IMG-20210713-WA0050.png' },
    { name: 'Zinc Sulphate 25kg', brand: 'IFFCO', price: 850, category: 'fertilisers', image: 'https://mahadhan.co.in/wp-content/uploads/2017/05/mircronutrients5.jpg' },
  ]

  const pesticides = [
    { name: 'Glyphosate 41% SL 1L', brand: 'Roundup', price: 450, category: 'pesticides', image: 'https://cdn.dotpe.in/longtail/store-items/6792607/7fTS3PLN.jpeg' },
    { name: '2,4-D Amine 58% SL 500ml', brand: 'UPL', price: 380, category: 'pesticides', image: 'https://cpimg.tistatic.com/01472840/b/8/Finish-2-4-d-Amine-Salt-58-SL-.jpg' },
    { name: 'Chlorpyriphos 20% EC 1L', brand: 'Dhanuka', price: 520, category: 'pesticides', image: 'https://5.imimg.com/data5/SELLER/Default/2025/1/478897222/EW/FD/MK/4089734/chlorpyriphos-20-e-c.jpeg' },
    { name: 'Imidacloprid 17.8% SL 250ml', brand: 'Bayer', price: 680, category: 'pesticides', image: 'https://agribegri.com/_next/image?url=https%3A%2F%2Fdujjhct8zer0r.cloudfront.net%2Fmedia%2Fprod_image%2F19527420041738388746.webp&w=1080&q=75' },
  ]

  const organic = [
    { name: 'Farm Yard Manure 50kg', brand: 'Organic', price: 600, category: 'organic', image: 'https://m.media-amazon.com/images/I/61yYAgzYG9L._AC_UF1000,1000_QL80_.jpg' },
    { name: 'Compost 50kg', brand: 'Organic', price: 550, category: 'organic', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw0ojY2SUnvEUhTQU5Ul6lapcdS1GRekvqtQ&s' },
    { name: 'Vermicompost 50kg', brand: 'Organic', price: 800, category: 'organic', image: 'https://www.bbassets.com/media/uploads/p/l/40317554_3-go-green-vermi-compost.jpg' },
    { name: 'Cocopeat 50kg', brand: 'Organic', price: 450, category: 'organic', image: 'https://5.imimg.com/data5/SELLER/Default/2021/8/VW/ZY/BU/23851373/cocopeat-5kg-500x500.png' },
    { name: 'Neem Cake 25kg', brand: 'Organic', price: 750, category: 'organic', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWL5b7CJ_C-qHOn79PFoumMoJ1ZAWDrtgL6A&s' },
    { name: 'Mustard Cake 25kg', brand: 'Organic', price: 680, category: 'organic', image: 'https://m.media-amazon.com/images/I/71N--OMLcsL._AC_UF1000,1000_QL80_.jpg' },
  ]

  const machinery = [
    { name: 'Tractor - 35 HP', brand: 'Mahindra', price: 850000, category: 'machinery', image: 'https://5.imimg.com/data5/BP/AG/XY/GLADMIN-12/trcs.jpg' },
    { name: 'Rotavator 6 Feet', brand: 'Fieldking', price: 150000, category: 'machinery', image: 'https://5.imimg.com/data5/SELLER/Default/2022/11/QK/SJ/IU/146002418/fieldking-rotavator.jpg' },
    { name: 'Cultivator 9 Tines', brand: 'Fieldking', price:100000, category: 'machinery', image: 'https://tiimg.tistatic.com/fp/1/008/394/2000x870x1150-mm-agricultural-mild-steel-9-tines-cultivator-726.jpg' },
  ]

  const allProducts = [
    ...seeds.slice(0, 10),
    ...fertilisers.slice(0, 10),
    ...pesticides.slice(0, 10),
    ...organic.slice(0, 10),
    ...machinery.slice(0, 10)
  ].map((product, index) => ({
    ...product,
    id: index + 1,
    description: `${product.name} by ${product.brand}. High quality agricultural product for better yield.`,
    rating: (Math.random() * 2 + 3).toFixed(1),
    reviews: Math.floor(Math.random() * 100) + 10,
    inStock: Math.random() > 0.1,
    discount: Math.random() > 0.7 ? Math.floor(Math.random() * 20) + 5 : 0,
  }))

  return allProducts
}

export const products = generateProducts()

export const getProductsByCategory = (category) => {
  if (!category || category === 'all') return products
  return products.filter(p => p.category === category)
}

export const getProductById = (id) => products.find(p => p.id === parseInt(id))

export const searchProducts = (query) => {
  const lowerQuery = query.toLowerCase()
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery)
  )
}
