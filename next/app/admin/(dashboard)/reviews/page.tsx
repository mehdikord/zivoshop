"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Search, ChevronDown, ChevronUp, Eye, Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  user: { id: string; name: string; mobile: string } | null;
  product: { id: string; name: string; slug: string; image: string | null } | null;
  images: Array<{ id: string; path: string }>;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    rating: "",
    isApproved: "",
    productId: "",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
pageSize: "10",
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: meta.page.toString(),
      pageSize: filters.pageSize.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    if (filters.search) params.set("search", filters.search);
    if (filters.rating) params.set("rating", filters.rating);
    if (filters.isApproved !== "") params.set("isApproved", filters.isApproved);
    if (filters.productId) params.set("productId", filters.productId);

    try {
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setMeta(data.meta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    loadReviews();
  }, [filters, meta.page]);

  const handleSort = (field: string) => {
    setFilters((f) => ({
      ...f,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === "desc" ? "asc" : "desc",
    }));
  };

  const handlePageChange = (page: number) => {
    setMeta((m) => ({ ...m, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((f) => ({ ...f, pageSize: pageSize.toString() }));
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const openDetail = (review: Review) => {
    setSelectedReview(review);
    setDetailOpen(true);
  };

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: approve }),
      });
      const data = await res.json();
      if (data.success) loadReviews();
      else alert(data.message || "خطا در بروزرسانی");
    } catch {
      alert("خطای شبکه");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadReviews();
      else alert(data.message || "خطا در حذف");
    } catch {
      alert("خطای شبکه");
    }
  };

  const stars = (rating: number) => (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "text-amber-500 fill-current" : "text-muted-foreground"}`} />
      ))}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت نظرات کاربران</h1>
          <p className="text-muted-foreground">مشاهده، تایید، رد و حذف نظرات محصولات</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در متن، عنوان، کاربر، محصول..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && loadReviews()}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filters.rating} onValueChange={(v) => setFilters((f) => ({ ...f, rating: v }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="امتیاز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="5">۵ ستاره</SelectItem>
                  <SelectItem value="4">۴ ستاره</SelectItem>
                  <SelectItem value="3">۳ ستاره</SelectItem>
                  <SelectItem value="2">۲ ستاره</SelectItem>
                  <SelectItem value="1">۱ ستاره</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.isApproved} onValueChange={(v) => setFilters((f) => ({ ...f, isApproved: v }))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="وضعیت تایید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="true">تایید شده</SelectItem>
                  <SelectItem value="false">در انتظار</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.pageSize} onValueChange={(v) => handlePageSizeChange(Number(v))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="نمایش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">۱۰</SelectItem>
                  <SelectItem value="20">۲۰</SelectItem>
                  <SelectItem value="50">۵۰</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>امتیاز</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                  تاریخ {filters.sortBy === "createdAt" && (filters.sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />)}
                </TableHead>
                <TableHead>محصول</TableHead>
                <TableHead>کاربر</TableHead>
                <TableHead>متن نظر</TableHead>
                <TableHead>تصاویر</TableHead>
                <TableHead>خرید تایید شده</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead className="w-[140px]">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>در حال بارگذاری...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    نظری یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-muted/50">
                    <TableCell>{stars(review.rating)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {review.createdAt ? formatRelativeTime(review.createdAt) : "—"}
                    </TableCell>
                    <TableCell>
                      {review.product && (
                        <div className="flex items-center gap-2">
                          {review.product.image && <img src={review.product.image} alt="" className="h-8 w-8 rounded object-cover" />}
                          <span className="font-medium max-w-xs truncate">{review.product.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {review.user?.name ? (
                        <>
                          <p className="font-medium">{review.user.name}</p>
                          <p className="text-muted-foreground">{review.user.mobile}</p>
                        </>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {review.title && <p className="font-medium">{review.title}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2">{review.content}</p>
                    </TableCell>
                    <TableCell>
                      {review.images.length > 0 ? (
                        <div className="flex gap-1">
                          {review.images.slice(0, 3).map((img) => (
                            <img key={img.id} src={img.path} alt="" className="h-8 w-8 rounded object-cover" />
                          ))}
                          {review.images.length > 3 && (
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                              +{review.images.length - 3}
                            </div>
                          )}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {review.verifiedPurchase ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" /> بله
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" /> خیر
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={review.isApproved ? "success" : "warning"}>
                        {review.isApproved ? "تایید شده" : "در انتظار"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openDetail(review)} title="مشاهده">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!review.isApproved && (
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(review.id, true)} title="تایید" className="text-green-600 hover:bg-green-50">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {review.isApproved && (
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(review.id, false)} title="لغو تایید" className="text-amber-600 hover:bg-amber-50">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)} title="حذف" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="card-footer flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            نمایش {reviews.length} از {meta.total} نظر
          </p>
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {detailOpen && selectedReview && (
        <ReviewDetailDialog
          review={selectedReview}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
}

function ReviewDetailDialog({ review, open, onOpenChange }: { review: Review; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">جزئیات نظر</h2>
          <button onClick={() => onOpenChange(false)} className="p-1 rounded hover:bg-muted">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="flex items-center gap-3">
            {stars(review.rating)}
            <Badge variant={review.isApproved ? "success" : "warning"}>
              {review.isApproved ? "تایید شده" : "در انتظار تایید"}
            </Badge>
            {review.verifiedPurchase && (
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" /> خرید تایید شده
              </Badge>
            )}
          </div>

          {review.title && <h3 className="text-lg font-medium">{review.title}</h3>}
          <p className="whitespace-pre-wrap">{review.content}</p>

          <div className="border-t pt-4 space-y-3 text-sm">
            <p><strong>کاربر:</strong> {review.user?.name || "—"} ({review.user?.mobile || "—"})</p>
            <p><strong>محصول:</strong> {review.product?.name || "—"}</p>
            <p><strong>تاریخ:</strong> {review.createdAt ? formatRelativeTime(review.createdAt) : "—"}</p>
          </div>

          {review.images.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">تصاویر ({review.images.length})</h4>
              <div className="flex gap-2 flex-wrap">
                {review.images.map((img) => (
                  <img key={img.id} src={img.path} alt="" className="h-20 w-20 rounded object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function stars(rating: number) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-5 w-5 ${i < rating ? "text-amber-500 fill-current" : "text-muted-foreground"}`} />
      ))}
    </span>
  );
}