"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, Order, OrderItem, OrderStatus } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { useShippingStore } from "@/stores/shipping-store";
import { provinceShippingFee, shippingCost } from "@/lib/cart";

type Step = 1 | 2 | 3 | 4;

type CheckoutState = {
  step: Step;
  /** Saved address book. */
  addresses: Address[];
  /** Currently selected address for this order. */
  selectedAddressId: string | null;
  /** Customer notes for the order. */
  notes: string;
  /** The placed order (set after payment). */
  order: Order | null;
  /** Has addresses been loaded from API. */
  addressesLoaded: boolean;

  setStep: (step: Step) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  setNotes: (notes: string) => void;
  placeOrder: (status: OrderStatus) => Order | null;
  loadAddresses: () => Promise<void>;
  reset: () => void;
};

const INITIAL: Pick<CheckoutState, "step" | "selectedAddressId" | "notes" | "order" | "addressesLoaded"> = {
  step: 1,
  selectedAddressId: null,
  notes: "",
  order: null,
  addressesLoaded: false,
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      addresses: [],

      setStep: (step) => set({ step }),

      addAddress: (address: Omit<Address, "id"> & { id?: string }) => {
        const id = address.id ?? `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({ addresses: [...state.addresses, { ...address, id }] }));
      },

      removeAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.filter((a) => a.id !== id),
          selectedAddressId:
            state.selectedAddressId === id ? null : state.selectedAddressId,
        })),

      selectAddress: (id) => set({ selectedAddressId: id }),

      setNotes: (notes) => set({ notes }),

      loadAddresses: async () => {
        const state = get();
        if (state.addressesLoaded) return;
        try {
          const res = await fetch("/api/addresses");
          const data = await res.json();
          if (data.success) {
            set({
              addresses: data.data.map((a: {
                id: string;
                title: string;
                provinceName: string;
                cityName: string;
                provinceId: string;
                cityId: string;
                postalCode: string;
                fullAddress: string;
                receiverName: string | null;
                receiverPhone: string | null;
                isDefault: boolean;
              }) => ({
                id: a.id,
                title: a.title,
                province: a.provinceName,
                city: a.cityName,
                provinceId: a.provinceId,
                cityId: a.cityId,
                postalCode: a.postalCode,
                fullAddress: a.fullAddress,
                receiverName: a.receiverName ?? undefined,
                receiverPhone: a.receiverPhone ?? undefined,
                isDefault: a.isDefault,
              })),
              addressesLoaded: true,
            });
          }
        } catch {
          // keep empty on failure
        }
      },

      placeOrder: (status: OrderStatus) => {
        const cart = useCartStore.getState();
        const { addresses, selectedAddressId, notes } = get();
        const address = addresses.find((a) => a.id === selectedAddressId);
        if (!address || cart.items.length === 0) return null;

        const items: OrderItem[] = cart.items.map((item, i) => ({
          id: `oi-${Date.now()}-${i}`,
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.price,
          unitDiscount: Math.max(0, item.price - (item.discountPrice ?? item.price)),
        }));

        const subtotal = cart.items.reduce(
          (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
          0,
        );
        const discountTotal = cart.items.reduce(
          (sum, i) =>
            sum + Math.max(0, i.price - (i.discountPrice ?? i.price)) * i.quantity,
          0,
        );
        const shippingStore = useShippingStore.getState();
        const destinationFee = provinceShippingFee(
          address.provinceId,
          address.province,
          shippingStore.provinces,
          shippingStore.baseShippingFee,
        );
        const shippingCostVal = shippingCost(
          subtotal,
          shippingStore.freeShippingThreshold,
          destinationFee,
        );
        const total = subtotal + shippingCostVal;

        const order: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: `ZV-${Date.now().toString().slice(-8)}`,
          userId: "user-mock",
          items,
          subtotal,
          discountTotal,
          shippingCost: shippingCostVal,
          total,
          shippingAddress: address,
          customerNote: notes || undefined,
          status,
          createdAt: new Date().toISOString(),
        };

        set({ order });
        cart.clearCart();
        return order;
      },

      reset: () => set({ ...INITIAL, notes: "" }),
    }),
    {
      name: "zivo-checkout",
      partialize: (state) => ({
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
        notes: state.notes,
      }),
    },
  ),
);