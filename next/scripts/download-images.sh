#!/usr/bin/env bash
mkdir -p public/images
declare -A imgs=(
  ["editorial-white.jpg"]="1509631179647-0177331693ae"
  ["editorial-coat.jpg"]="1524504388940-b1c1722653e1"
  ["editorial-coat2.jpg"]="1483985988355-763728e1935b"
  ["editorial-hat.jpg"]="1445205170230-053b83016050"
  ["editorial-pink.jpg"]="1512436991641-6745cdb1723f"
  ["editorial-red.jpg"]="1544441893-675973e31985"
  ["editorial-black.jpg"]="1496747611176-843222e1e57c"
  ["editorial-a.jpg"]="1529626455594-4ff0802cfb7e"
  ["editorial-b.jpg"]="1534528741775-53994a69daeb"
  ["editorial-c.jpg"]="1517841905240-472988babdf9"
  ["editorial-d.jpg"]="1487412720507-e7ab37603c6f"
  ["editorial-e.jpg"]="1438761681033-6461ffad8d80"
  ["editorial-f.jpg"]="1544005313-94ddf0286df2"
  ["editorial-g.jpg"]="1520975916090-3105956dac38"
  ["editorial-h.jpg"]="1539109136881-3be0616acf4b"
  ["editorial-i.jpg"]="1529139574466-a303027c1d8b"
  ["editorial-j.jpg"]="1531746020798-e6953c6e8e04"
  ["product-tshirt.jpg"]="1521572163474-6864f9cf17ab"
  ["rack-clothes.jpg"]="1485968579580-b6d095142e6e"
  ["beauty-1.jpg"]="1596755094514-f87e34085b2c"
  ["beauty-2.jpg"]="1618354691373-d851c5c3a990"
  ["beauty-3.jpg"]="1594633312681-425c7b97ccd1"
)
for name in "${!imgs[@]}"; do
  id="${imgs[$name]}"
  curl -s --max-time 30 -L "https://images.unsplash.com/photo-${id}?q=80&w=1600&auto=format&fit=crop" -o "public/images/$name" &
done
wait
echo "Downloaded: $(ls public/images | wc -l) images"
