import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, RefreshCw, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

const fastFoodStores = [
  { 
    name: "KFC", 
    location: "123 Food St, City", 
    menu: [
      { item: "Zinger Burger", price: 50, image: "/images/kfc_zinger.jpg" }, 
      { item: "Streetwise 2", price: 40, image: "/images/kfc_streetwise.jpg" }
    ] 
  },
  // ... other stores with added location
];

export default function FastFoodRoulette() {
  const [budget, setBudget] = useState(200);
  const [selectedItems, setSelectedItems] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [showLocations, setShowLocations] = useState({});

  const toggleLocation = (index) => {
    setShowLocations(prev => ({...prev, [index]: !prev[index]}));
  };

  const spinRoulette = () => {
    if (budget < 30) {
      alert("Your budget is too low for any meal. Please increase it.");
      return;
    }

    setSpinning(true);
    setSelectedItems([]);
    
    setTimeout(() => {
      let remainingBudget = budget;
      let selected = [];
      let stores = [...fastFoodStores];
      
      // Sort by price ascending to get more items within budget
      stores.forEach(store => {
        store.menu.sort((a, b) => a.price - b.price);
      });

      // Try to get one item from each store within budget
      stores.forEach(store => {
        const affordableItems = store.menu.filter(item => item.price <= remainingBudget);
        if (affordableItems.length > 0) {
          // Pick the most expensive affordable item
          const chosenItem = affordableItems[affordableItems.length - 1];
          selected.push({
            store: store.name,
            location: store.location,
            item: chosenItem.item,
            price: chosenItem.price,
            image: chosenItem.image
          });
          remainingBudget -= chosenItem.price;
        }
      });

      // If no items selected, pick the single best item
      if (selected.length === 0) {
        const allItems = stores.flatMap(store => 
          store.menu.map(item => ({...item, store: store.name, location: store.location}))
        );
        const bestItem = allItems.reduce((prev, current) => 
          (current.price <= budget && current.price > prev.price) ? current : prev
        , {price: 0});
        
        if (bestItem.price > 0) {
          selected.push(bestItem);
        }
      }

      setSelectedItems(selected);
      setSpinning(false);
    }, 1500);
  };

  const adjustBudget = (amount) => {
    const newBudget = Math.max(30, budget + amount);
    setBudget(newBudget);
  };

  return (
    <div className="p-6 max-w-lg mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Fast Food Finder</h1>
      
      <div className="mb-6">
        <p className="mb-2 text-lg">Your budget:</p>
        <div className="flex items-center justify-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => adjustBudget(-10)}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="text-2xl font-bold">R{budget}</div>
          <Button variant="outline" size="icon" onClick={() => adjustBudget(10)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button 
        onClick={spinRoulette} 
        className="w-full mb-6"
        disabled={spinning}
      >
        {spinning ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        {spinning ? "Finding meals..." : "Find Meals"}
      </Button>

      {!spinning && selectedItems.length === 0 && (
        <p className="text-gray-500 py-4">
          Set your budget and click "Find Meals" to see options
        </p>
      )}

      <div className="space-y-4">
        {selectedItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-4">
              <div className="flex items-start space-x-4">
                <img 
                  src={item.image} 
                  alt={item.item} 
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="font-bold">{item.store}</p>
                  <p className="text-lg">{item.item}</p>
                  <p className="text-sm text-gray-500">R{item.price}</p>
                  
                  {showLocations[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 text-sm"
                    >
                      📍 {item.location}
                    </motion.div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleLocation(index)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {showLocations[index] ? "Hide" : "Location"}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-semibold">
            Total: R{selectedItems.reduce((sum, item) => sum + item.price, 0)}
            {budget - selectedItems.reduce((sum, item) => sum + item.price, 0) > 0 && (
              <span className="text-gray-500 ml-2">
                (R{budget - selectedItems.reduce((sum, item) => sum + item.price, 0)} remaining)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
