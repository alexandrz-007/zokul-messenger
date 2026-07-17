interface OnlineDotProps {
  online: boolean;
  size?: number;
}

export default function OnlineDot({ online, size = 10 }: OnlineDotProps) {
  if (!online) return null;
  return (
    <span
      className="absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900 bg-green-500"
      style={{ width: size, height: size }}
    />
  );
}
