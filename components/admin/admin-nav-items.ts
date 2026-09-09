import {
  LayoutDashboard,
  Users,
  FolderTree,
  Building2,
  Package,
  Star,
  ShoppingCart,
  Ticket,
  Image,
  FileText,
  Settings,
  Activity,
  Home,
  Images,
  SlidersHorizontal,
  Truck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const adminNavGroups: NavGroup[] = [
  {
    title: "اصلی",
    items: [
      {
        icon: LayoutDashboard,
        label: "داشبورد",
        href: "/admin",
      },
    ],
  },
  {
    title: "مدیریت کاربران",
    items: [
      {
        icon: Users,
        label: "مدیران",
        href: "/admin/admins",
      },
      {
        icon: Users,
        label: "کاربران",
        href: "/admin/users",
      },
    ],
  },
  {
    title: "مدیریت محصولات",
    items: [
      {
        icon: FolderTree,
        label: "دسته‌بندی‌ها",
        href: "/admin/categories",
      },
      {
        icon: Building2,
        label: "برندها",
        href: "/admin/brands",
      },
      {
        icon: Package,
        label: "محصولات",
        href: "/admin/products",
      },
      {
        icon: SlidersHorizontal,
        label: "ویژگی محصولات",
        href: "/admin/product-attributes",
      },
    ],
  },
  {
    title: "مدیریت فروش",
    items: [
      {
        icon: ShoppingCart,
        label: "سفارشات",
        href: "/admin/orders",
      },
      {
        icon: Truck,
        label: "تنظیمات ارسال",
        href: "/admin/shipping-settings",
      },
      {
        icon: Ticket,
        label: "کدهای تخفیف",
        href: "/admin/coupons",
      },
      {
        icon: Star,
        label: "نظرات",
        href: "/admin/reviews",
      },
    ],
  },
  {
    title: "مدیریت محتوا",
    items: [
      {
        icon: Images,
        label: "رسانه",
        href: "/admin/media",
      },
      {
        icon: Image,
        label: "بنرها",
        href: "/admin/banners",
      },
      {
        icon: FileText,
        label: "صفحات",
        href: "/admin/pages",
      },
      {
        icon: Settings,
        label: "تنظیمات",
        href: "/admin/settings",
      },
    ],
  },
  {
    title: "سیستم",
    items: [
      {
        icon: Activity,
        label: "لاگ فعالیت",
        href: "/admin/activity-logs",
      },
      {
        icon: Home,
        label: "بازگشت به سایت",
        href: "/",
      },
    ],
  },
];
