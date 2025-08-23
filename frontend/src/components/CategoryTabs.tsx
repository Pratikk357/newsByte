import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "All News" },
  { id: "breaking", label: "Breaking" },
  { id: "politics", label: "Politics" },
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "sports", label: "Sports" },
  { id: "health", label: "Health" },
  { id: "science", label: "Science" }
];

async function fetchCategories() {
  const res = await axios.get('/categories?limit=10');
  if (!res.data.success) throw new Error('Network error');
  return res.data;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  
  const {  data:categories , isLoading, error } = useQuery({
    queryKey : ['categories'],
    queryFn: fetchCategories,
  });

  if(!categories) return <div> Loading... </div>
  return (
    <div className="w-full overflow-x-auto pb-2">
      <Tabs value={activeCategory} onValueChange={onCategoryChange} className="w-full">
        <TabsList className="flex w-max bg-secondary/50 gap-1">
          {[{id:"random_fucking_shit",name:"All"},...categories.responseObject.data].map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.name}
              className="capitalize data-[state=active]:bg-news-primary data-[state=active]:text-white"
            >
              {category.name.replaceAll("/","")}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default CategoryTabs;