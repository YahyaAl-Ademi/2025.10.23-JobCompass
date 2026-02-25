export default function formatAddress(address) {
  const streetAddress = [
    address?.street,
    address?.street && address?.house_number,
    address?.city,
  ]
    .filter(Boolean)
    .join(" ");

  return [streetAddress, address?.country].filter(Boolean).join(", ");
}
