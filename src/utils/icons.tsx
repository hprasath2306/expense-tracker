import {
  UtensilsCrossed, Car, ShoppingBag, Receipt, Clapperboard,
  Heart, GraduationCap, Apple, Home, MoreHorizontal,
  Wallet, Plus, TrendingUp, TrendingDown, Calendar,
  ChevronLeft, ChevronRight, X, Check, Trash2, Edit2,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Search, Filter, Tag, CircleDollarSign, Flame, Target,
  type LucideProps,
} from 'lucide-react';
import React from 'react';

const iconMap: Record<string, React.FC<LucideProps>> = {
  UtensilsCrossed, Car, ShoppingBag, Receipt, Clapperboard,
  Heart, GraduationCap, Apple, Home, MoreHorizontal,
  Wallet, Plus, TrendingUp, TrendingDown, Calendar,
  ChevronLeft, ChevronRight, X, Check, Trash2, Edit2,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Search, Filter, Tag, CircleDollarSign, Flame, Target,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = iconMap[name];
  if (!Icon) return <CircleDollarSign {...props} />;
  return <Icon {...props} />;
}

export {
  UtensilsCrossed, Car, ShoppingBag, Receipt, Clapperboard,
  Heart, GraduationCap, Apple, Home, MoreHorizontal,
  Wallet, Plus, TrendingUp, TrendingDown, Calendar,
  ChevronLeft, ChevronRight, X, Check, Trash2, Edit2,
  PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  Search, Filter, Tag, CircleDollarSign, Flame, Target,
};
