import {
  FaShoppingCart,
  FaUtensils,
  FaCar,
  FaHeartbeat,
  FaGamepad,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { MdHome } from "react-icons/md";
import { categories } from "../../reducers/todoSlice";

const Categories = ({ category, setCategory }) => {

  return (
    <div className="mb-6">
      <label className="text-gray-500 font-medium block mb-3">Category</label>
      <div className="flex flex-wrap justify-center gap-4">
        {Object.values(categories).map(({ name, icon: Icon }) => (
          <motion.div
            key={name}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(name)}
            className="relative group"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                category === name
                  ? "bg-gradient-to-br from-[#429690] to-[#2A7C76]"
                  : "bg-white"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  category === name
                    ? "bg-gradient-to-br from-[#429690] to-[#2A7C76]"
                    : "bg-gray-50"
                }`}
              >
                <Icon
                  className={`text-2xl transition-all ${
                    category === name ? "text-white" : "text-gray-600"
                  }`}
                />
              </div>
            </div>

            <div
              className={`mt-2 text-xs font-medium text-center transition-all duration-300 ${
                category === name
                  ? "text-[#2A7C76] font-semibold"
                  : "text-gray-500"
              }`}
            >
              {name}
            </div>

            {category === name && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-[#2A7C76] rounded-full flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
