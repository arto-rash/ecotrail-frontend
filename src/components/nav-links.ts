import { Compass, Leaf, Map, Users } from "lucide-react";

export const NAV_LINKS = [
  { href: "/trails", label: "Explore", icon: Compass },
  { href: "/trails?view=map", label: "Map", icon: Map },
  { href: "/guides", label: "Guides", icon: Users },
  { href: "/challenges", label: "Eco-challenges", icon: Leaf },
] as const;
