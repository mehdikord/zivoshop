"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Address } from "@/types";

interface Province {
  id: string;
  name: string;
  slug: string;
  cities: City[];
}

interface City {
  id: string;
  name: string;
  slug: string;
}

export function AddressForm({
  initial,
  onSave,
  onCancel,
  defaultName,
  defaultPhone,
}: {
  initial?: Address;
  onSave: (address: Omit<Address, "id"> & { id?: string }) => void;
  onCancel?: () => void;
  defaultName?: string;
  defaultPhone?: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [receiverName, setReceiverName] = useState(initial?.receiverName ?? (initial ? "" : (defaultName ?? "")));
  const [receiverPhone, setReceiverPhone] = useState(initial?.receiverPhone ?? (initial ? "" : (defaultPhone ?? "")));
  const [provinceId, setProvinceId] = useState(initial?.provinceId ?? "");
  const [cityId, setCityId] = useState(initial?.cityId ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [fullAddress, setFullAddress] = useState(initial?.fullAddress ?? "");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);

  useEffect(() => {
    async function fetchProvinces() {
      try {
        const res = await fetch("/api/provinces");
        const data = await res.json();
        if (data.success) {
          setProvinces(data.data);
        }
      } catch {
        console.error("Failed to load provinces");
      } finally {
        setLoadingProvinces(false);
      }
    }
    fetchProvinces();
  }, []);

  const availableCities = provinces.find((p) => p.id === provinceId)?.cities ?? [];

  const isValid =
    title.trim() !== "" &&
    receiverName.trim() !== "" &&
    receiverPhone.trim() !== "" &&
    provinceId !== "" &&
    cityId !== "" &&
    postalCode.trim().length >= 10 &&
    fullAddress.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    const selectedProvince = provinces.find((p) => p.id === provinceId);
    const selectedCity = availableCities.find((c) => c.id === cityId);
    onSave({
      id: initial?.id,
      title: title.trim(),
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      provinceId,
      cityId,
      province: selectedProvince?.name ?? "",
      city: selectedCity?.name ?? "",
      postalCode: postalCode.trim(),
      fullAddress: fullAddress.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="addr-title">عنوان آدرس</Label>
        <Input
          id="addr-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثلاً خانه / محل کار"
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="addr-name">نام گیرنده</Label>
          <Input
            id="addr-name"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="نام کامل"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="addr-phone">شماره تماس</Label>
          <Input
            id="addr-phone"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            className="mt-1.5"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>استان</Label>
          <Select
            value={provinceId}
            onValueChange={(v) => {
              setProvinceId(v);
              setCityId("");
            }}
            disabled={loadingProvinces}
          >
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder="انتخاب استان" />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>شهر</Label>
          <Select value={cityId} onValueChange={setCityId} disabled={!provinceId || availableCities.length === 0}>
            <SelectTrigger className="mt-1.5 w-full">
              <SelectValue placeholder={provinceId ? "انتخاب شهر" : "ابتدا استان را انتخاب کنید"} />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="addr-postal">کد پستی</Label>
        <Input
          id="addr-postal"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
          placeholder="۱۲۳۴۵۶۷۸۹۰"
          className="mt-1.5"
          inputMode="numeric"
          dir="ltr"
          maxLength={10}
        />
      </div>

      <div>
        <Label htmlFor="addr-full">آدرس کامل</Label>
        <Input
          id="addr-full"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          placeholder="خیابان، کوچه، پلاک، واحد"
          className="mt-1.5"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="gold" disabled={!isValid || loadingProvinces}>
          {initial ? "ذخیره تغییرات" : "افزودن آدرس"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
        ) : null}
      </div>
    </form>
  );
}