export interface ProductVariety {
  id: string;
  name: string;
  title: string;
  image: string;
  thumb: string;
  price: number;
  weight: string;
  origin: string;
  seller: string;
  description: string;
}

export type ProductAngle = ProductVariety;

export const productVarietiesMap: Record<string, ProductVariety[]> = {
  // 1. APPLE
  Apple: [
    {
      id: 'apple-front',
      name: 'Front View',
      title: 'Fresh Red Apple',
      image: '/src/frontend/assets/images/products/apple.jpg',
      thumb: '/src/frontend/assets/images/products/apple.jpg',
      price: 150,
      weight: '1 kg',
      origin: 'Kullu, HP',
      seller: 'Himalaya Farm',
      description:
        'Crisp, juicy and naturally sweet red apples, grown by local farmers using organic methods. Perfect for snacking, juicing or adding to your favourite recipes.',
    },
    {
      id: 'apple-closeup',
      name: 'Close-up',
      title: 'Fresh Red Apple',
      image: '/src/frontend/assets/images/products/apple-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/apple-closeup.jpg',
      price: 150,
      weight: '1 kg',
      origin: 'Kullu, HP',
      seller: 'Himalaya Farm',
      description:
        'Crisp, juicy and naturally sweet red apples, grown by local farmers using organic methods. Perfect for snacking, juicing or adding to your favourite recipes.',
    },
    {
      id: 'apple-cut',
      name: 'Cut Section',
      title: 'Fresh Red Apple',
      image: '/src/frontend/assets/images/products/apple-sliced.jpg',
      thumb: '/src/frontend/assets/images/products/apple-sliced.jpg',
      price: 150,
      weight: '1 kg',
      origin: 'Kullu, HP',
      seller: 'Himalaya Farm',
      description:
        'Crisp, juicy and naturally sweet red apples, grown by local farmers using organic methods. Perfect for snacking, juicing or adding to your favourite recipes.',
    },
    {
      id: 'apple-top',
      name: 'Top Angle',
      title: 'Fresh Red Apple',
      image: '/src/frontend/assets/images/products/apple-top.jpg',
      thumb: '/src/frontend/assets/images/products/apple-top.jpg',
      price: 150,
      weight: '1 kg',
      origin: 'Kullu, HP',
      seller: 'Himalaya Farm',
      description:
        'Crisp, juicy and naturally sweet red apples, grown by local farmers using organic methods. Perfect for snacking, juicing or adding to your favourite recipes.',
    },
  ],

  // 2. HONEY
  Honey: [
    {
      id: 'honey-front',
      name: 'Front View',
      title: 'Mustang Wild Mountain Honey',
      image: '/src/frontend/assets/images/products/honey.jpg',
      thumb: '/src/frontend/assets/images/products/honey.jpg',
      price: 1800,
      weight: '1 kg',
      origin: 'Mustang, Nepal',
      seller: 'Pure Natural',
      description:
        'Raw, unprocessed wild honey harvested from high-altitude cliff bee colonies in Mustang. Rich in natural pollens, enzymes, and deep floral notes.',
    },
    {
      id: 'honey-closeup',
      name: 'Close-up',
      title: 'Mustang Wild Mountain Honey',
      image: '/src/frontend/assets/images/products/honey-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/honey-closeup.jpg',
      price: 1800,
      weight: '1 kg',
      origin: 'Mustang, Nepal',
      seller: 'Pure Natural',
      description:
        'Raw, unprocessed wild honey harvested from high-altitude cliff bee colonies in Mustang. Rich in natural pollens, enzymes, and deep floral notes.',
    },
    {
      id: 'honey-dipper',
      name: 'Honey Dipper',
      title: 'Mustang Wild Mountain Honey',
      image: '/src/frontend/assets/images/products/honey-dipper.jpg',
      thumb: '/src/frontend/assets/images/products/honey-dipper.jpg',
      price: 1800,
      weight: '1 kg',
      origin: 'Mustang, Nepal',
      seller: 'Pure Natural',
      description:
        'Raw, unprocessed wild honey harvested from high-altitude cliff bee colonies in Mustang. Rich in natural pollens, enzymes, and deep floral notes.',
    },
    {
      id: 'honey-top',
      name: 'Top Angle',
      title: 'Mustang Wild Mountain Honey',
      image: '/src/frontend/assets/images/products/honey-top.jpg',
      thumb: '/src/frontend/assets/images/products/honey-top.jpg',
      price: 1800,
      weight: '1 kg',
      origin: 'Mustang, Nepal',
      seller: 'Pure Natural',
      description:
        'Raw, unprocessed wild honey harvested from high-altitude cliff bee colonies in Mustang. Rich in natural pollens, enzymes, and deep floral notes.',
    },
  ],

  // 3. ORANGE
  Orange: [
    {
      id: 'orange-front',
      name: 'Front View',
      title: 'Organic Sweet Oranges',
      image: '/src/frontend/assets/images/products/orange.jpg',
      thumb: '/src/frontend/assets/images/products/orange.jpg',
      price: 650,
      weight: '1 kg',
      origin: 'Sunsari, Nepal',
      seller: 'Fresh Valley',
      description:
        'Sun-ripened, easy-to-peel sweet oranges bursting with natural juice, delicate acidity, and rich vitamin C from the eastern sunny orchards.',
    },
    {
      id: 'orange-closeup',
      name: 'Close-up',
      title: 'Organic Sweet Oranges',
      image: '/src/frontend/assets/images/products/orange-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/orange-closeup.jpg',
      price: 650,
      weight: '1 kg',
      origin: 'Sunsari, Nepal',
      seller: 'Fresh Valley',
      description:
        'Sun-ripened, easy-to-peel sweet oranges bursting with natural juice, delicate acidity, and rich vitamin C from the eastern sunny orchards.',
    },
    {
      id: 'orange-cut',
      name: 'Cut Section',
      title: 'Organic Sweet Oranges',
      image: '/src/frontend/assets/images/products/orange-cut.jpg',
      thumb: '/src/frontend/assets/images/products/orange-cut.jpg',
      price: 650,
      weight: '1 kg',
      origin: 'Sunsari, Nepal',
      seller: 'Fresh Valley',
      description:
        'Sun-ripened, easy-to-peel sweet oranges bursting with natural juice, delicate acidity, and rich vitamin C from the eastern sunny orchards.',
    },
    {
      id: 'orange-top',
      name: 'Top Angle',
      title: 'Organic Sweet Oranges',
      image: '/src/frontend/assets/images/products/orange-top.jpg',
      thumb: '/src/frontend/assets/images/products/orange-top.jpg',
      price: 650,
      weight: '1 kg',
      origin: 'Sunsari, Nepal',
      seller: 'Fresh Valley',
      description:
        'Sun-ripened, easy-to-peel sweet oranges bursting with natural juice, delicate acidity, and rich vitamin C from the eastern sunny orchards.',
    },
  ],

  // 4. AVOCADO
  Avocado: [
    {
      id: 'avocado-front',
      name: 'Front View',
      title: 'Fresh Organic Hass Avocado',
      image: '/src/frontend/assets/images/products/avocado.jpg',
      thumb: '/src/frontend/assets/images/products/avocado.jpg',
      price: 850,
      weight: '1 kg',
      origin: 'Damak, Nepal',
      seller: 'Green Harvest',
      description:
        'Dark pebbled skin and velvety rich buttery flesh with a rich nutty flavor ideal for guacamole, salads, and healthy morning toasts.',
    },
    {
      id: 'avocado-closeup',
      name: 'Close-up',
      title: 'Fresh Organic Hass Avocado',
      image: '/src/frontend/assets/images/products/avocado-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/avocado-closeup.jpg',
      price: 850,
      weight: '1 kg',
      origin: 'Damak, Nepal',
      seller: 'Green Harvest',
      description:
        'Dark pebbled skin and velvety rich buttery flesh with a rich nutty flavor ideal for guacamole, salads, and healthy morning toasts.',
    },
    {
      id: 'avocado-cut',
      name: 'Cut Section',
      title: 'Fresh Organic Hass Avocado',
      image: '/src/frontend/assets/images/products/avocado-cut.jpg',
      thumb: '/src/frontend/assets/images/products/avocado-cut.jpg',
      price: 850,
      weight: '1 kg',
      origin: 'Damak, Nepal',
      seller: 'Green Harvest',
      description:
        'Dark pebbled skin and velvety rich buttery flesh with a rich nutty flavor ideal for guacamole, salads, and healthy morning toasts.',
    },
    {
      id: 'avocado-top',
      name: 'Top Angle',
      title: 'Fresh Organic Hass Avocado',
      image: '/src/frontend/assets/images/products/avocado-top.jpg',
      thumb: '/src/frontend/assets/images/products/avocado-top.jpg',
      price: 850,
      weight: '1 kg',
      origin: 'Damak, Nepal',
      seller: 'Green Harvest',
      description:
        'Dark pebbled skin and velvety rich buttery flesh with a rich nutty flavor ideal for guacamole, salads, and healthy morning toasts.',
    },
  ],

  // 5. BANANA
  Banana: [
    {
      id: 'banana-front',
      name: 'Front View',
      title: 'Farm Fresh Golden Bananas',
      image: '/src/frontend/assets/images/products/banana.jpg',
      thumb: '/src/frontend/assets/images/products/banana.jpg',
      price: 180,
      weight: '1 kg',
      origin: 'Chitwan, Nepal',
      seller: 'Valley Fresh',
      description:
        'Naturally sweet and aromatic golden yellow bananas packed with potassium and natural carbohydrates. The perfect healthy daily breakfast snack.',
    },
    {
      id: 'banana-closeup',
      name: 'Close-up',
      title: 'Farm Fresh Golden Bananas',
      image: '/src/frontend/assets/images/products/banana-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/banana-closeup.jpg',
      price: 180,
      weight: '1 kg',
      origin: 'Chitwan, Nepal',
      seller: 'Valley Fresh',
      description:
        'Naturally sweet and aromatic golden yellow bananas packed with potassium and natural carbohydrates. The perfect healthy daily breakfast snack.',
    },
    {
      id: 'banana-cut',
      name: 'Sliced View',
      title: 'Farm Fresh Golden Bananas',
      image: '/src/frontend/assets/images/products/banana-sliced.jpg',
      thumb: '/src/frontend/assets/images/products/banana-sliced.jpg',
      price: 180,
      weight: '1 kg',
      origin: 'Chitwan, Nepal',
      seller: 'Valley Fresh',
      description:
        'Naturally sweet and aromatic golden yellow bananas packed with potassium and natural carbohydrates. The perfect healthy daily breakfast snack.',
    },
    {
      id: 'banana-top',
      name: 'Top Angle',
      title: 'Farm Fresh Golden Bananas',
      image: '/src/frontend/assets/images/products/banana-top.jpg',
      thumb: '/src/frontend/assets/images/products/banana-top.jpg',
      price: 180,
      weight: '1 kg',
      origin: 'Chitwan, Nepal',
      seller: 'Valley Fresh',
      description:
        'Naturally sweet and aromatic golden yellow bananas packed with potassium and natural carbohydrates. The perfect healthy daily breakfast snack.',
    },
  ],

  // 6. TOMATO
  Tomato: [
    {
      id: 'tomato-front',
      name: 'Front View',
      title: 'Vine-Ripened Fresh Red Tomatoes',
      image: '/src/frontend/assets/images/products/tomato.jpg',
      thumb: '/src/frontend/assets/images/products/tomato.jpg',
      price: 120,
      weight: '1 kg',
      origin: 'Kavre, Nepal',
      seller: 'Hillside Farm',
      description:
        'Plump, juicy, deep-red vine-ripened tomatoes bursting with wholesome garden flavor. Excellent for fresh salads, gravies, and homemade sauces.',
    },
    {
      id: 'tomato-closeup',
      name: 'Close-up',
      title: 'Vine-Ripened Fresh Red Tomatoes',
      image: '/src/frontend/assets/images/products/tomato-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/tomato-closeup.jpg',
      price: 120,
      weight: '1 kg',
      origin: 'Kavre, Nepal',
      seller: 'Hillside Farm',
      description:
        'Plump, juicy, deep-red vine-ripened tomatoes bursting with wholesome garden flavor. Excellent for fresh salads, gravies, and homemade sauces.',
    },
    {
      id: 'tomato-cut',
      name: 'Cut Section',
      title: 'Vine-Ripened Fresh Red Tomatoes',
      image: '/src/frontend/assets/images/products/tomato-cut.jpg',
      thumb: '/src/frontend/assets/images/products/tomato-cut.jpg',
      price: 120,
      weight: '1 kg',
      origin: 'Kavre, Nepal',
      seller: 'Hillside Farm',
      description:
        'Plump, juicy, deep-red vine-ripened tomatoes bursting with wholesome garden flavor. Excellent for fresh salads, gravies, and homemade sauces.',
    },
    {
      id: 'tomato-top',
      name: 'Top Angle',
      title: 'Vine-Ripened Fresh Red Tomatoes',
      image: '/src/frontend/assets/images/products/tomato-top.jpg',
      thumb: '/src/frontend/assets/images/products/tomato-top.jpg',
      price: 120,
      weight: '1 kg',
      origin: 'Kavre, Nepal',
      seller: 'Hillside Farm',
      description:
        'Plump, juicy, deep-red vine-ripened tomatoes bursting with wholesome garden flavor. Excellent for fresh salads, gravies, and homemade sauces.',
    },
  ],

  // 7. POTATO
  Potato: [
    {
      id: 'potato-front',
      name: 'Front View',
      title: 'Mountain Fresh Whole Potatoes',
      image: '/src/frontend/assets/images/products/potato.jpg',
      thumb: '/src/frontend/assets/images/products/potato.jpg',
      price: 90,
      weight: '1 kg',
      origin: 'Palpa, Nepal',
      seller: 'Mountain Harvest',
      description:
        'Firm, earthy mountain potatoes with thin skins and dense golden flesh. Holds shape beautifully in tarkaris, curries, and comforting roasts.',
    },
    {
      id: 'potato-closeup',
      name: 'Close-up',
      title: 'Mountain Fresh Whole Potatoes',
      image: '/src/frontend/assets/images/products/potato-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/potato-closeup.jpg',
      price: 90,
      weight: '1 kg',
      origin: 'Palpa, Nepal',
      seller: 'Mountain Harvest',
      description:
        'Firm, earthy mountain potatoes with thin skins and dense golden flesh. Holds shape beautifully in tarkaris, curries, and comforting roasts.',
    },
    {
      id: 'potato-cut',
      name: 'Cut Section',
      title: 'Mountain Fresh Whole Potatoes',
      image: '/src/frontend/assets/images/products/potato-cut.jpg',
      thumb: '/src/frontend/assets/images/products/potato-cut.jpg',
      price: 90,
      weight: '1 kg',
      origin: 'Palpa, Nepal',
      seller: 'Mountain Harvest',
      description:
        'Firm, earthy mountain potatoes with thin skins and dense golden flesh. Holds shape beautifully in tarkaris, curries, and comforting roasts.',
    },
    {
      id: 'potato-top',
      name: 'Top Angle',
      title: 'Mountain Fresh Whole Potatoes',
      image: '/src/frontend/assets/images/products/potato-top.jpg',
      thumb: '/src/frontend/assets/images/products/potato-top.jpg',
      price: 90,
      weight: '1 kg',
      origin: 'Palpa, Nepal',
      seller: 'Mountain Harvest',
      description:
        'Firm, earthy mountain potatoes with thin skins and dense golden flesh. Holds shape beautifully in tarkaris, curries, and comforting roasts.',
    },
  ],

  // 8. SPINACH
  Spinach: [
    {
      id: 'spinach-front',
      name: 'Front View',
      title: 'Fresh Green Farm Palak Saag',
      image: '/src/frontend/assets/images/products/spinach.jpg',
      thumb: '/src/frontend/assets/images/products/spinach.jpg',
      price: 80,
      weight: '500 g',
      origin: 'Bhaktapur, Nepal',
      seller: 'Green Leaf Farm',
      description:
        'Tender broad-leafed organic spinach harvested fresh at dawn. Loaded with plant iron, folate, and vitamins for nutritious daily home cooking.',
    },
    {
      id: 'spinach-closeup',
      name: 'Close-up',
      title: 'Fresh Green Farm Palak Saag',
      image: '/src/frontend/assets/images/products/spinach-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/spinach-closeup.jpg',
      price: 80,
      weight: '500 g',
      origin: 'Bhaktapur, Nepal',
      seller: 'Green Leaf Farm',
      description:
        'Tender broad-leafed organic spinach harvested fresh at dawn. Loaded with plant iron, folate, and vitamins for nutritious daily home cooking.',
    },
    {
      id: 'spinach-bowl',
      name: 'Bowl View',
      title: 'Fresh Green Farm Palak Saag',
      image: '/src/frontend/assets/images/products/spinach-bowl.jpg',
      thumb: '/src/frontend/assets/images/products/spinach-bowl.jpg',
      price: 80,
      weight: '500 g',
      origin: 'Bhaktapur, Nepal',
      seller: 'Green Leaf Farm',
      description:
        'Tender broad-leafed organic spinach harvested fresh at dawn. Loaded with plant iron, folate, and vitamins for nutritious daily home cooking.',
    },
    {
      id: 'spinach-top',
      name: 'Top Angle',
      title: 'Fresh Green Farm Palak Saag',
      image: '/src/frontend/assets/images/products/spinach-top.jpg',
      thumb: '/src/frontend/assets/images/products/spinach-top.jpg',
      price: 80,
      weight: '500 g',
      origin: 'Bhaktapur, Nepal',
      seller: 'Green Leaf Farm',
      description:
        'Tender broad-leafed organic spinach harvested fresh at dawn. Loaded with plant iron, folate, and vitamins for nutritious daily home cooking.',
    },
  ],

  // 9. TURMERIC
  Turmeric: [
    {
      id: 'turmeric-front',
      name: 'Front View',
      title: 'Pure Organic Golden Turmeric',
      image: '/src/frontend/assets/images/products/turmeric.jpg',
      thumb: '/src/frontend/assets/images/products/turmeric.jpg',
      price: 220,
      weight: '250 g',
      origin: 'Ilam, Nepal',
      seller: 'Spice Garden',
      description:
        'High-potency organic golden turmeric rich in natural curcumin and volatile oils. Adds authentic warmth, color, and immunity to every meal.',
    },
    {
      id: 'turmeric-closeup',
      name: 'Close-up',
      title: 'Pure Organic Golden Turmeric',
      image: '/src/frontend/assets/images/products/turmeric-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/turmeric-closeup.jpg',
      price: 220,
      weight: '250 g',
      origin: 'Ilam, Nepal',
      seller: 'Spice Garden',
      description:
        'High-potency organic golden turmeric rich in natural curcumin and volatile oils. Adds authentic warmth, color, and immunity to every meal.',
    },
    {
      id: 'turmeric-root',
      name: 'Cut Root',
      title: 'Pure Organic Golden Turmeric',
      image: '/src/frontend/assets/images/products/turmeric-root.jpg',
      thumb: '/src/frontend/assets/images/products/turmeric-root.jpg',
      price: 220,
      weight: '250 g',
      origin: 'Ilam, Nepal',
      seller: 'Spice Garden',
      description:
        'High-potency organic golden turmeric rich in natural curcumin and volatile oils. Adds authentic warmth, color, and immunity to every meal.',
    },
    {
      id: 'turmeric-powder',
      name: 'Powder View',
      title: 'Pure Organic Golden Turmeric',
      image: '/src/frontend/assets/images/products/turmeric-powder.jpg',
      thumb: '/src/frontend/assets/images/products/turmeric-powder.jpg',
      price: 220,
      weight: '250 g',
      origin: 'Ilam, Nepal',
      seller: 'Spice Garden',
      description:
        'High-potency organic golden turmeric rich in natural curcumin and volatile oils. Adds authentic warmth, color, and immunity to every meal.',
    },
  ],

  // 10. CHILI
  Chili: [
    {
      id: 'chili-front',
      name: 'Front View',
      title: 'Fresh Mountain Hot Red Chilies',
      image: '/src/frontend/assets/images/products/chili.jpg',
      thumb: '/src/frontend/assets/images/products/chili.jpg',
      price: 160,
      weight: '200 g',
      origin: 'Dang, Nepal',
      seller: 'Aroma Spices',
      description:
        'Sun-ripened, intensely fragrant mountain red chilies delivering a vibrant fiery heat to everyday dal bhat, curries, and spicy fresh chutneys.',
    },
    {
      id: 'chili-closeup',
      name: 'Close-up',
      title: 'Fresh Mountain Hot Red Chilies',
      image: '/src/frontend/assets/images/products/chili-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/chili-closeup.jpg',
      price: 160,
      weight: '200 g',
      origin: 'Dang, Nepal',
      seller: 'Aroma Spices',
      description:
        'Sun-ripened, intensely fragrant mountain red chilies delivering a vibrant fiery heat to everyday dal bhat, curries, and spicy fresh chutneys.',
    },
    {
      id: 'chili-cut',
      name: 'Cut Section',
      title: 'Fresh Mountain Hot Red Chilies',
      image: '/src/frontend/assets/images/products/chili-cut.jpg',
      thumb: '/src/frontend/assets/images/products/chili-cut.jpg',
      price: 160,
      weight: '200 g',
      origin: 'Dang, Nepal',
      seller: 'Aroma Spices',
      description:
        'Sun-ripened, intensely fragrant mountain red chilies delivering a vibrant fiery heat to everyday dal bhat, curries, and spicy fresh chutneys.',
    },
    {
      id: 'chili-top',
      name: 'Top Angle',
      title: 'Fresh Mountain Hot Red Chilies',
      image: '/src/frontend/assets/images/products/chili-top.jpg',
      thumb: '/src/frontend/assets/images/products/chili-top.jpg',
      price: 160,
      weight: '200 g',
      origin: 'Dang, Nepal',
      seller: 'Aroma Spices',
      description:
        'Sun-ripened, intensely fragrant mountain red chilies delivering a vibrant fiery heat to everyday dal bhat, curries, and spicy fresh chutneys.',
    },
  ],

  // 11. CUMIN
  Cumin: [
    {
      id: 'cumin-front',
      name: 'Front View',
      title: 'Premium Whole Fragrant Cumin Seeds',
      image: '/src/frontend/assets/images/products/cumin.jpg',
      thumb: '/src/frontend/assets/images/products/cumin.jpg',
      price: 190,
      weight: '200 g',
      origin: 'Nepalgunj, Nepal',
      seller: 'Spice Garden',
      description:
        'Sun-dried whole cumin seeds with prominent ridges and high essential oil content. Crackles with rich nutty fragrance when tempered in ghee.',
    },
    {
      id: 'cumin-closeup',
      name: 'Close-up',
      title: 'Premium Whole Fragrant Cumin Seeds',
      image: '/src/frontend/assets/images/products/cumin-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/cumin-closeup.jpg',
      price: 190,
      weight: '200 g',
      origin: 'Nepalgunj, Nepal',
      seller: 'Spice Garden',
      description:
        'Sun-dried whole cumin seeds with prominent ridges and high essential oil content. Crackles with rich nutty fragrance when tempered in ghee.',
    },
    {
      id: 'cumin-roast',
      name: 'Roast View',
      title: 'Premium Whole Fragrant Cumin Seeds',
      image: '/src/frontend/assets/images/products/cumin-roasted.jpg',
      thumb: '/src/frontend/assets/images/products/cumin-roasted.jpg',
      price: 190,
      weight: '200 g',
      origin: 'Nepalgunj, Nepal',
      seller: 'Spice Garden',
      description:
        'Sun-dried whole cumin seeds with prominent ridges and high essential oil content. Crackles with rich nutty fragrance when tempered in ghee.',
    },
    {
      id: 'cumin-top',
      name: 'Top Angle',
      title: 'Premium Whole Fragrant Cumin Seeds',
      image: '/src/frontend/assets/images/products/cumin-top.jpg',
      thumb: '/src/frontend/assets/images/products/cumin-top.jpg',
      price: 190,
      weight: '200 g',
      origin: 'Nepalgunj, Nepal',
      seller: 'Spice Garden',
      description:
        'Sun-dried whole cumin seeds with prominent ridges and high essential oil content. Crackles with rich nutty fragrance when tempered in ghee.',
    },
  ],

  // 12. MILK
  Milk: [
    {
      id: 'milk-front',
      name: 'Front View',
      title: 'Farm Fresh Pasteurized Pure Milk',
      image: '/src/frontend/assets/images/products/milk.jpg',
      thumb: '/src/frontend/assets/images/products/milk.jpg',
      price: 110,
      weight: '1 litre',
      origin: 'Chitwan, Nepal',
      seller: 'Local Dairy',
      description:
        'Wholesome, naturally sweet whole milk collected twice daily from healthy pasture-grazed cows. Gentle, light, and easy to digest.',
    },
    {
      id: 'milk-closeup',
      name: 'Close-up',
      title: 'Farm Fresh Pasteurized Pure Milk',
      image: '/src/frontend/assets/images/products/milk-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/milk-closeup.jpg',
      price: 110,
      weight: '1 litre',
      origin: 'Chitwan, Nepal',
      seller: 'Local Dairy',
      description:
        'Wholesome, naturally sweet whole milk collected twice daily from healthy pasture-grazed cows. Gentle, light, and easy to digest.',
    },
    {
      id: 'milk-glass',
      name: 'Glass View',
      title: 'Farm Fresh Pasteurized Pure Milk',
      image: '/src/frontend/assets/images/products/milk-toned.jpg',
      thumb: '/src/frontend/assets/images/products/milk-toned.jpg',
      price: 110,
      weight: '1 litre',
      origin: 'Chitwan, Nepal',
      seller: 'Local Dairy',
      description:
        'Wholesome, naturally sweet whole milk collected twice daily from healthy pasture-grazed cows. Gentle, light, and easy to digest.',
    },
    {
      id: 'milk-top',
      name: 'Bottle Top',
      title: 'Farm Fresh Pasteurized Pure Milk',
      image: '/src/frontend/assets/images/products/milk-bottle.jpg',
      thumb: '/src/frontend/assets/images/products/milk-bottle.jpg',
      price: 110,
      weight: '1 litre',
      origin: 'Chitwan, Nepal',
      seller: 'Local Dairy',
      description:
        'Wholesome, naturally sweet whole milk collected twice daily from healthy pasture-grazed cows. Gentle, light, and easy to digest.',
    },
  ],

  // 13. EGGS
  Eggs: [
    {
      id: 'eggs-front',
      name: 'Front View',
      title: 'Free-Range Fresh Farm Brown Eggs',
      image: '/src/frontend/assets/images/products/eggs.jpg',
      thumb: '/src/frontend/assets/images/products/eggs.jpg',
      price: 240,
      weight: '12 pcs',
      origin: 'Nuwakot, Nepal',
      seller: 'Farm Fresh Dairy',
      description:
        'Farm-fresh brown eggs laid by cage-free hens raised on clean grains and open sunshine. Features thick sturdy shells and deep orange yolks.',
    },
    {
      id: 'eggs-closeup',
      name: 'Close-up',
      title: 'Free-Range Fresh Farm Brown Eggs',
      image: '/src/frontend/assets/images/products/eggs-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/eggs-closeup.jpg',
      price: 240,
      weight: '12 pcs',
      origin: 'Nuwakot, Nepal',
      seller: 'Farm Fresh Dairy',
      description:
        'Farm-fresh brown eggs laid by cage-free hens raised on clean grains and open sunshine. Features thick sturdy shells and deep orange yolks.',
    },
    {
      id: 'eggs-yolk',
      name: 'Cracked Yolk',
      title: 'Free-Range Fresh Farm Brown Eggs',
      image: '/src/frontend/assets/images/products/eggs-crack.jpg',
      thumb: '/src/frontend/assets/images/products/eggs-crack.jpg',
      price: 240,
      weight: '12 pcs',
      origin: 'Nuwakot, Nepal',
      seller: 'Farm Fresh Dairy',
      description:
        'Farm-fresh brown eggs laid by cage-free hens raised on clean grains and open sunshine. Features thick sturdy shells and deep orange yolks.',
    },
    {
      id: 'eggs-basket',
      name: 'Basket View',
      title: 'Free-Range Fresh Farm Brown Eggs',
      image: '/src/frontend/assets/images/products/eggs-basket.jpg',
      thumb: '/src/frontend/assets/images/products/eggs-basket.jpg',
      price: 240,
      weight: '12 pcs',
      origin: 'Nuwakot, Nepal',
      seller: 'Farm Fresh Dairy',
      description:
        'Farm-fresh brown eggs laid by cage-free hens raised on clean grains and open sunshine. Features thick sturdy shells and deep orange yolks.',
    },
  ],

  // 14. YOGURT
  Yogurt: [
    {
      id: 'yogurt-front',
      name: 'Front View',
      title: 'Traditional Thick Set Curd (Dahi)',
      image: '/src/frontend/assets/images/products/yogurt.jpg',
      thumb: '/src/frontend/assets/images/products/yogurt.jpg',
      price: 130,
      weight: '500 g',
      origin: 'Kathmandu, Nepal',
      seller: 'Local Dairy',
      description:
        'Homestyle thick curd cultured slowly overnight from pure fresh milk. Mildly tart and naturally creamy, excellent for cooling meals, raita, and lassi.',
    },
    {
      id: 'yogurt-closeup',
      name: 'Close-up',
      title: 'Traditional Thick Set Curd (Dahi)',
      image: '/src/frontend/assets/images/products/yogurt-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/yogurt-closeup.jpg',
      price: 130,
      weight: '500 g',
      origin: 'Kathmandu, Nepal',
      seller: 'Local Dairy',
      description:
        'Homestyle thick curd cultured slowly overnight from pure fresh milk. Mildly tart and naturally creamy, excellent for cooling meals, raita, and lassi.',
    },
    {
      id: 'yogurt-curd',
      name: 'Spoon Scoop',
      title: 'Traditional Thick Set Curd (Dahi)',
      image: '/src/frontend/assets/images/products/yogurt-curd.jpg',
      thumb: '/src/frontend/assets/images/products/yogurt-curd.jpg',
      price: 130,
      weight: '500 g',
      origin: 'Kathmandu, Nepal',
      seller: 'Local Dairy',
      description:
        'Homestyle thick curd cultured slowly overnight from pure fresh milk. Mildly tart and naturally creamy, excellent for cooling meals, raita, and lassi.',
    },
    {
      id: 'yogurt-top',
      name: 'Top Angle',
      title: 'Traditional Thick Set Curd (Dahi)',
      image: '/src/frontend/assets/images/products/yogurt-top.jpg',
      thumb: '/src/frontend/assets/images/products/yogurt-top.jpg',
      price: 130,
      weight: '500 g',
      origin: 'Kathmandu, Nepal',
      seller: 'Local Dairy',
      description:
        'Homestyle thick curd cultured slowly overnight from pure fresh milk. Mildly tart and naturally creamy, excellent for cooling meals, raita, and lassi.',
    },
  ],

  // 15. RICE
  Rice: [
    {
      id: 'rice-front',
      name: 'Front View',
      title: 'Aged Long-Grain Himalayan Rice',
      image: '/src/frontend/assets/images/products/rice.jpg',
      thumb: '/src/frontend/assets/images/products/rice.jpg',
      price: 950,
      weight: '5 kg',
      origin: 'Jhapa, Nepal',
      seller: 'Golden Grain',
      description:
        'Naturally aged Himalayan rice with long slender grains. Cooks up fluffy, fragrant, and non-sticky, making every home meal a royal feast.',
    },
    {
      id: 'rice-closeup',
      name: 'Close-up',
      title: 'Aged Long-Grain Himalayan Rice',
      image: '/src/frontend/assets/images/products/rice-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/rice-closeup.jpg',
      price: 950,
      weight: '5 kg',
      origin: 'Jhapa, Nepal',
      seller: 'Golden Grain',
      description:
        'Naturally aged Himalayan rice with long slender grains. Cooks up fluffy, fragrant, and non-sticky, making every home meal a royal feast.',
    },
    {
      id: 'rice-scoop',
      name: 'Scoop View',
      title: 'Aged Long-Grain Himalayan Rice',
      image: '/src/frontend/assets/images/products/rice-scoop.jpg',
      thumb: '/src/frontend/assets/images/products/rice-scoop.jpg',
      price: 950,
      weight: '5 kg',
      origin: 'Jhapa, Nepal',
      seller: 'Golden Grain',
      description:
        'Naturally aged Himalayan rice with long slender grains. Cooks up fluffy, fragrant, and non-sticky, making every home meal a royal feast.',
    },
    {
      id: 'rice-top',
      name: 'Top Angle',
      title: 'Aged Long-Grain Himalayan Rice',
      image: '/src/frontend/assets/images/products/rice-top.jpg',
      thumb: '/src/frontend/assets/images/products/rice-top.jpg',
      price: 950,
      weight: '5 kg',
      origin: 'Jhapa, Nepal',
      seller: 'Golden Grain',
      description:
        'Naturally aged Himalayan rice with long slender grains. Cooks up fluffy, fragrant, and non-sticky, making every home meal a royal feast.',
    },
  ],

  // 16. WHEAT
  Wheat: [
    {
      id: 'wheat-front',
      name: 'Front View',
      title: '100% Stone-Ground Whole Wheat Atta',
      image: '/src/frontend/assets/images/products/wheat.jpg',
      thumb: '/src/frontend/assets/images/products/wheat.jpg',
      price: 780,
      weight: '5 kg',
      origin: 'Dang, Nepal',
      seller: 'Harvest Mill',
      description:
        'Milled slowly on traditional stone chakkis to retain all bran, germ, and endosperm nutrients. Yields soft, puffed rotis that stay tender all day.',
    },
    {
      id: 'wheat-closeup',
      name: 'Close-up',
      title: '100% Stone-Ground Whole Wheat Atta',
      image: '/src/frontend/assets/images/products/wheat-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/wheat-closeup.jpg',
      price: 780,
      weight: '5 kg',
      origin: 'Dang, Nepal',
      seller: 'Harvest Mill',
      description:
        'Milled slowly on traditional stone chakkis to retain all bran, germ, and endosperm nutrients. Yields soft, puffed rotis that stay tender all day.',
    },
    {
      id: 'wheat-sack',
      name: 'Flour Sack',
      title: '100% Stone-Ground Whole Wheat Atta',
      image: '/src/frontend/assets/images/products/wheat-chakki.jpg',
      thumb: '/src/frontend/assets/images/products/wheat-chakki.jpg',
      price: 780,
      weight: '5 kg',
      origin: 'Dang, Nepal',
      seller: 'Harvest Mill',
      description:
        'Milled slowly on traditional stone chakkis to retain all bran, germ, and endosperm nutrients. Yields soft, puffed rotis that stay tender all day.',
    },
    {
      id: 'wheat-top',
      name: 'Top Angle',
      title: '100% Stone-Ground Whole Wheat Atta',
      image: '/src/frontend/assets/images/products/wheat-top.jpg',
      thumb: '/src/frontend/assets/images/products/wheat-top.jpg',
      price: 780,
      weight: '5 kg',
      origin: 'Dang, Nepal',
      seller: 'Harvest Mill',
      description:
        'Milled slowly on traditional stone chakkis to retain all bran, germ, and endosperm nutrients. Yields soft, puffed rotis that stay tender all day.',
    },
  ],

  // 17. LENTILS
  Lentils: [
    {
      id: 'lentils-front',
      name: 'Front View',
      title: 'Split Golden Lentils (Dal)',
      image: '/src/frontend/assets/images/products/lentils.jpg',
      thumb: '/src/frontend/assets/images/products/lentils.jpg',
      price: 280,
      weight: '1 kg',
      origin: 'Siraha, Nepal',
      seller: 'Golden Grain',
      description:
        'Quick-cooking split lentils that melt into a velvety, golden dal that absorbs cumin, garlic, and ghee tadka to sheer perfection.',
    },
    {
      id: 'lentils-closeup',
      name: 'Close-up',
      title: 'Split Golden Lentils (Dal)',
      image: '/src/frontend/assets/images/products/lentils-closeup.jpg',
      thumb: '/src/frontend/assets/images/products/lentils-closeup.jpg',
      price: 280,
      weight: '1 kg',
      origin: 'Siraha, Nepal',
      seller: 'Golden Grain',
      description:
        'Quick-cooking split lentils that melt into a velvety, golden dal that absorbs cumin, garlic, and ghee tadka to sheer perfection.',
    },
    {
      id: 'lentils-scoop',
      name: 'Scoop View',
      title: 'Split Golden Lentils (Dal)',
      image: '/src/frontend/assets/images/products/lentils-scoop.jpg',
      thumb: '/src/frontend/assets/images/products/lentils-scoop.jpg',
      price: 280,
      weight: '1 kg',
      origin: 'Siraha, Nepal',
      seller: 'Golden Grain',
      description:
        'Quick-cooking split lentils that melt into a velvety, golden dal that absorbs cumin, garlic, and ghee tadka to sheer perfection.',
    },
    {
      id: 'lentils-top',
      name: 'Top Angle',
      title: 'Split Golden Lentils (Dal)',
      image: '/src/frontend/assets/images/products/lentils-top.jpg',
      thumb: '/src/frontend/assets/images/products/lentils-top.jpg',
      price: 280,
      weight: '1 kg',
      origin: 'Siraha, Nepal',
      seller: 'Golden Grain',
      description:
        'Quick-cooking split lentils that melt into a velvety, golden dal that absorbs cumin, garlic, and ghee tadka to sheer perfection.',
    },
  ],
};

/**
 * Returns 4 distinct angle views for any product based on its name or category.
 */
export function getProductVarieties(product: {
  id: string;
  name: string;
  category?: string;
  price?: number;
  weight?: string;
  origin?: string;
  seller?: string;
  image?: string;
  gallery?: string[];
}): ProductVariety[] {
  const name = product.name || '';
  const normalized = name.toLowerCase().trim();

  // 1. Direct key match
  for (const [key, list] of Object.entries(productVarietiesMap)) {
    if (normalized.includes(key.toLowerCase())) {
      return list;
    }
  }

  // 2. Keyword fallback checks
  if (normalized.includes('apple') || normalized.includes('seb')) {
    return productVarietiesMap.Apple;
  }
  if (normalized.includes('honey') || normalized.includes('maha')) {
    return productVarietiesMap.Honey;
  }
  if (normalized.includes('orange') || normalized.includes('suntala')) {
    return productVarietiesMap.Orange;
  }
  if (normalized.includes('avocado')) {
    return productVarietiesMap.Avocado;
  }
  if (normalized.includes('banana') || normalized.includes('kera')) {
    return productVarietiesMap.Banana;
  }
  if (normalized.includes('tomato') || normalized.includes('golbheda')) {
    return productVarietiesMap.Tomato;
  }
  if (normalized.includes('potato') || normalized.includes('alu')) {
    return productVarietiesMap.Potato;
  }
  if (normalized.includes('spinach') || normalized.includes('palak')) {
    return productVarietiesMap.Spinach;
  }
  if (normalized.includes('turmeric') || normalized.includes('haldi') || normalized.includes('besar')) {
    return productVarietiesMap.Turmeric;
  }
  if (normalized.includes('chili') || normalized.includes('chilli') || normalized.includes('khursani')) {
    return productVarietiesMap.Chili;
  }
  if (normalized.includes('cumin') || normalized.includes('jeera')) {
    return productVarietiesMap.Cumin;
  }
  if (normalized.includes('milk') || normalized.includes('dudh')) {
    return productVarietiesMap.Milk;
  }
  if (normalized.includes('egg')) {
    return productVarietiesMap.Eggs;
  }
  if (normalized.includes('yogurt') || normalized.includes('curd') || normalized.includes('dahi')) {
    return productVarietiesMap.Yogurt;
  }
  if (normalized.includes('rice') || normalized.includes('chamal')) {
    return productVarietiesMap.Rice;
  }
  if (normalized.includes('wheat') || normalized.includes('atta')) {
    return productVarietiesMap.Wheat;
  }
  if (normalized.includes('lentil') || normalized.includes('dal')) {
    return productVarietiesMap.Lentils;
  }

  // 3. Category match fallback
  const category = (product.category || '').toLowerCase();
  if (category.includes('fruit')) return productVarietiesMap.Apple;
  if (category.includes('veg')) return productVarietiesMap.Tomato;
  if (category.includes('spice')) return productVarietiesMap.Chili;
  if (category.includes('dairy')) return productVarietiesMap.Milk;
  if (category.includes('grain')) return productVarietiesMap.Rice;
  if (category.includes('honey')) return productVarietiesMap.Honey;

  // 4. Fallback: generate 4 angle cubes from product details
  const baseImg = product.image || '/src/frontend/assets/images/organic-vegetables.jpg';
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [baseImg];
  return [
    {
      id: `${product.id}-angle-front`,
      name: 'Front View',
      title: product.name,
      image: gallery[0] || baseImg,
      thumb: gallery[0] || baseImg,
      price: product.price || 150,
      weight: product.weight || '1 kg',
      origin: product.origin || 'Nepal',
      seller: product.seller || 'Local Farm',
      description: `${product.name} sourced fresh from trusted local growers using natural farming practices.`,
    },
    {
      id: `${product.id}-angle-closeup`,
      name: 'Close-up',
      title: product.name,
      image: gallery[1 % gallery.length] || baseImg,
      thumb: gallery[1 % gallery.length] || baseImg,
      price: product.price || 150,
      weight: product.weight || '1 kg',
      origin: product.origin || 'Nepal',
      seller: product.seller || 'Local Farm',
      description: `${product.name} sourced fresh from trusted local growers using natural farming practices.`,
    },
    {
      id: `${product.id}-angle-cut`,
      name: 'Cut Section',
      title: product.name,
      image: gallery[2 % gallery.length] || baseImg,
      thumb: gallery[2 % gallery.length] || baseImg,
      price: product.price || 150,
      weight: product.weight || '1 kg',
      origin: product.origin || 'Nepal',
      seller: product.seller || 'Local Farm',
      description: `${product.name} sourced fresh from trusted local growers using natural farming practices.`,
    },
    {
      id: `${product.id}-angle-top`,
      name: 'Top Angle',
      title: product.name,
      image: gallery[3 % gallery.length] || baseImg,
      thumb: gallery[3 % gallery.length] || baseImg,
      price: product.price || 150,
      weight: product.weight || '1 kg',
      origin: product.origin || 'Nepal',
      seller: product.seller || 'Local Farm',
      description: `${product.name} sourced fresh from trusted local growers using natural farming practices.`,
    },
  ];
}
