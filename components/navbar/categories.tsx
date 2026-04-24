"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { TbTrees } from "react-icons/tb";
import { FaLandmark } from "react-icons/fa";
import { IoDiamond } from "react-icons/io5";
import { MdOutlineRestaurant, MdLocationCity } from "react-icons/md";

import Container from "@/components/container";
import CategoryBox from "@/components/category-box";

export const categories = [
  {
    label: "Food Tour",
    icon: MdOutlineRestaurant,
    description: "Taste authentic local cuisine with a guide.",
  },
  {
    label: "Nature & Culture",
    icon: TbTrees,
    description: "Discover nature spots and cultural heritage.",
  },
  {
    label: "City Walk",
    icon: MdLocationCity,
    description: "Explore the city on foot with a local.",
  },
  {
    label: "Heritage Tour",
    icon: FaLandmark,
    description: "Visit landmarks and historical sites.",
  },
  {
    label: "Lux",
    icon: IoDiamond,
    description: "Premium private experiences.",
  },
];

const Categories = () => {
  const params = useSearchParams();
  const category = params?.get("category");
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return (
    <Container>
      <div className="flex items-center justify-between overflow-x-auto pt-4">
        {categories.map((item) => (
          <CategoryBox
            key={item.label}
            label={item.label}
            icon={item.icon}
            selected={category === item.label}
          />
        ))}
      </div>
    </Container>
  );
};

export default Categories;
